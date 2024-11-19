const express = require('express');
const bodyParser = require('body-parser');

// Simula uma base de dados para validar credenciais
const DATABASE = {
    usuario1: 'senhaSegura123',
    admin: 'admin123'
};

// Configurações de segurança
const MIN_PASSWORD_LENGTH = 8;
const MAX_LOGIN_ATTEMPTS = 3;

// Rastreamento de tentativas de login (exemplo simples, sem banco de dados)
const loginAttempts = {};

const app = express();
app.use(bodyParser.json()); // Middleware para interpretar JSON no corpo da requisição

// Middleware para limitar tentativas de login
function limitLoginAttempts(req, res, next) {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Usuário é obrigatório.' });
    }

    if (!loginAttempts[username]) {
        loginAttempts[username] = 0;
    }

    if (loginAttempts[username] >= MAX_LOGIN_ATTEMPTS) {
        return res.status(429).json({ error: 'Limite de tentativas excedido. Tente novamente mais tarde.' });
    }

    next();
}

// Rota para cadastro de usuários
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Verifica se o nome de usuário já existe
    if (DATABASE[username]) {
        return res.status(400).json({ error: 'Já existe usuário com esse nome.' });
    }

    // Verifica o comprimento mínimo da senha
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({
            error: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
        });
    }

    // Registra o novo usuário
    DATABASE[username] = password;
    return res.status(201).json({ message: 'Usuário registrado com sucesso!' });
});

// Rota para login
app.post('/login', limitLoginAttempts, (req, res) => {
    const { username, password } = req.body;

    // Verifica se as credenciais são válidas
    if (!DATABASE[username] || DATABASE[username] !== password) {
        loginAttempts[username] = (loginAttempts[username] || 0) + 1;
        return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }
    
    // Login bem-sucedido
    loginAttempts[username] = 0; // Reseta as tentativas após login bem-sucedido
    return res.status(200).json({ message: 'Login bem-sucedido!' });

});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
