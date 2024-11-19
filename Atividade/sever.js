const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken'); // Para criar e verificar tokens JWT
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(bodyParser.json());

const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'; // Use uma chave segura

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Mock de usuários
const users = [
  { username: 'user', password: '123456', id: 123, email: 'user@dominio.com', perfil: 'user' },
  { username: 'admin', password: '123456789', id: 124, email: 'admin@dominio.com', perfil: 'admin' },
  { username: 'colab', password: '123', id: 125, email: 'colab@dominio.com', perfil: 'user' },
];

// Função para autenticar usuário e gerar token JWT
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ id: user.id, perfil: user.perfil }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware para verificar o token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adiciona o usuário decodificado na requisição
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido ou expirado' });
  }
}

// Middleware para controle de acesso
function authorizeAdmin(req, res, next) {
  if (req.user.perfil !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
}

// Endpoint para recuperar dados do usuário logado
app.get('/api/me', authenticate, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  res.json({ user });
});

// Endpoint para recuperar dados de usuários (acesso apenas para admins)
app.get('/api/users', authenticate, authorizeAdmin, (req, res) => {
  res.json({ users });
});

// Endpoint para contratos (com prevenção de SQL Injection)
app.get('/api/contracts', authenticate, authorizeAdmin, (req, res) => {
  const { empresa, inicio } = req.query;

  if (!empresa || !inicio) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  // Simulando a proteção contra SQL Injection
  const sanitizedEmpresa = empresa.replace(/[^a-zA-Z0-9]/g, '');
  const sanitizedInicio = inicio.replace(/[^0-9-]/g, '');

  const contracts = getContracts(sanitizedEmpresa, sanitizedInicio);
  if (contracts.length > 0) {
    res.json({ contracts });
  } else {
    res.status(404).json({ error: 'Contratos não encontrados' });
  }
});

// Mock de função para buscar contratos
function getContracts(empresa, inicio) {
  return empresa === 'empresaValida' && inicio === '2024-01-01'
    ? [{ id: 1, name: 'Contrato A' }]
    : [];
}

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});
