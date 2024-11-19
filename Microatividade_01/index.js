const express = require('express'); // Importa o framework Express
const app = express(); // Cria a instância do app

// Simula o serviço fictício que retorna dados
const service = {
    call: (req) => {
        return { message: "Dados confidenciais acessados!", user: "Admin" };
    }
};

// Define a rota '/dados-Admin'
app.get('/dados-Admin', (req, res) => {
    // Chama o serviço fictício
    const jsonData = service.call(req);

    // Retorna os dados como JSON
    res.json(jsonData);
});
 
// Inicia o servidor
const PORT = 3000; // Porta do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
