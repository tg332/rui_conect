const API_URL = 'http://localhost:3000/api';

const btnEntrar = document.getElementById('btn-entrar');
const inputEmail = document.getElementById('email');
const inputSenha = document.getElementById('senha');

btnEntrar.addEventListener('click', async (event) => {
    event.preventDefault();

    const email = inputEmail.value.trim();
    const senha = inputSenha.value.trim();

    if (!email || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Bem-vindo, ${data.nome}!`);
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', data.nome);
        } else {
            alert(data.mensagem);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor. Verifique se o Node.js está rodando!');
    }
});