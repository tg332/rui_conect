const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: 'M12tiag@',      
    database: 'meu_site'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('✅ Conectado ao MySQL com sucesso!');
});

const JWT_SECRET = 'sua_chave_secreta_aqui';

// ---------------- ROTA PARA CRIAR USUÁRIO DE TESTE AUTOMÁTICO ----------------
app.get('/api/cadastrar-teste', async (req, res) => {
    try {
        const senhaHash = await bcrypt.hash('123456', 10);
        
        // Remove o usuário antigo e insere o novo com hash válido
        db.query('DELETE FROM usuarios WHERE email = ? OR nome = ?', ['teste@email.com', 'Tiago'], () => {
            const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
            db.query(sql, ['Tiago', 'teste@email.com', senhaHash], (err) => {
                if (err) return res.status(500).json({ erro: err });
                res.json({ mensagem: '✅ Usuário de teste criado/recriado com sucesso! Use email "teste@email.com" e senha "123456"' });
            });
        });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ---------------- ROTA DE LOGIN ----------------
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Preencha todos os campos!' });
    }

    const sql = 'SELECT * FROM usuarios WHERE email = ? OR nome = ?';
    db.query(sql, [email, email], async (err, results) => {
        if (err) {
            console.error('Erro no banco:', err);
            return res.status(500).json({ mensagem: 'Erro interno no banco de dados.' });
        }

        if (results.length === 0) {
            console.log(`❌ Usuário/Email não encontrado: ${email}`);
            return res.status(401).json({ mensagem: 'E-mail/usuário ou senha incorretos!' });
        }

        const usuario = results[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            console.log(`❌ Senha incorreta para o usuário: ${usuario.nome}`);
            return res.status(401).json({ mensagem: 'E-mail/usuário ou senha incorretos!' });
        }

        console.log(`✅ Login com sucesso: ${usuario.nome}`);
        const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ mensagem: 'Login realizado com sucesso!', token, nome: usuario.nome });
    });
});

app.listen(3000, () => {
    console.log('🚀 Servidor rodando em http://localhost:3000');
});

// ROTA DE CADASTRO
app.post('/api/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Preencha todos os campos!' });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
        
        db.query(sql, [nome, email, senhaHash], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ mensagem: 'E-mail ou Usuário já cadastrado!' });
                }
                return res.status(500).json({ mensagem: 'Erro interno ao cadastrar.' });
            }
            res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
        });
    } catch {
        res.status(500).json({ mensagem: 'Erro ao processar a senha.' });
    }
});