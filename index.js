const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const port = 3000;

// Middleware para permitir JSON no corpo da requisição
app.use(bodyParser.json());


// Configuração da conexão SQL Server
const config = {
  user: 'VirtualUser',   // usuário do SQL Server
  password: 'Develop@2024$',         // senha do SQL Server
  server: 'LAPTOP-ELISA\\SQLEXPRESS',               // endereço do servidor
  port: 1433,                        // Porta padrão do SQL Server
  database: 'webServiceReact',       // banco de dados
  options: {
    encrypt: false,                   // Para Azure: true, para local: false
    trustServerCertificate: true      // Para desenvolvimento local
  }
};

// Rota para receber dados da aplicação React Native
app.post('/dados', async (req, res) => {
  const { name, latitude, longitude, timestamp } = req.body;

  try {
    // Conectar ao banco de dados
    let pool = await sql.connect(config);
    
    const query = 'INSERT INTO localizacao (name, latitude, longitude, timestamp) VALUES (@name, @latitude, @longitude, @timestamp)';
    
    // Inserir dados no banco de dados
    await pool.request()
      .input('name', sql.VarChar, name)
      .input('latitude', sql.Decimal(9, 6), latitude)
      .input('longitude', sql.Decimal(9, 6), longitude)
      .input('timestamp', sql.DateTime, timestamp)
      .query(query);
    
    res.status(200).json({ message: 'Dados recebidos e salvos com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar os dados no SQL Server:', error);
    res.status(500).json({ message: 'Erro ao salvar os dados' });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

