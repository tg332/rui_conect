const API_URL = 'http://localhost:3000/api';

const btnCadastrar = document.getElementById('bnt-cadastrar');
const inputEmail = document.getElementById('email');
const inputPassword = document.getElementById('password');
const inputConfirmPassword = document.getElementById('confirme-password');
const inputUsuario = document.getElementById('usuario');

btnCadastrar.addEventListener('click', async (event) => {
    event.preventDefault();

    const email = inputEmail.value.trim();
    const senha = inputPassword.value.trim();
    const confirmeSenha = inputConfirmPassword.value.trim();
    const nome = inputUsuario.value.trim();

    // Validações no front-end
    if (!email || !senha || !confirmeSenha || !nome) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (senha !== confirmeSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cadastro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Cadastro realizado com sucesso!');
            // Redireciona para a tela de login
            window.location.href = 'index.html'; 
        } else {
            alert(data.mensagem);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor. Verifique se o Node.js está rodando!');
    }
});