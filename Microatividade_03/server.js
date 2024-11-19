const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = 'sua-chave-secreta';
const TOKEN_EXPIRATION = '1h'; // Token expira em 1 hora

// Mock de usuários
const USERS = {
    admin: '123456', // username: password
};

// Função para realizar login e gerar o token JWT
app.post('/auth', (req, res) => {
    const { username, password } = req.body;

    // Valida credenciais
    if (!USERS[username] || USERS[username] !== password) {
        return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    // Gera o token com expiração
    const token = jwt.sign(
        {
            username,
            exp: Math.floor(Date.now() / 1000) + 60 * 60, // Expiração em 1 hora
        },
        SECRET_KEY
    );

    return res.status(200).json({ jwt_token: token });
});

// Função protegida que valida o token
app.post('/do_SomeAction', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Acesso negado.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        // Retorna sucesso caso o token seja válido
        return res.status(200).json({ message: 'Ação realizada com sucesso!', data: decoded });
    } catch (err) {
        // Retorna erro genérico para token inválido/expirado
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
});

// Inicia o servidor
app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));
