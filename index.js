const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const port = 3000;

const moment = require('moment-timezone');



app.use(bodyParser.json());


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


app.post('/dados', async (req, res) => {
  try {
    const dados = Array.isArray(req.body) ? req.body : [req.body];

    let pool = await sql.connect(config);
  
    for (let dado of dados) {
      const { name, latitude, longitude, timestamp } = dado;
    
      if (!name || !latitude || !longitude || !timestamp) {
        return res.status(400).json({ message: 'Dados incompletos' });
      }

      const adjustedTimestamp = moment.utc(timestamp).toDate(); // Tratar como UTC diretamente

      const query = 'INSERT INTO localizacao (name, latitude, longitude, timestamp, sync_status) VALUES (@name, @latitude, @longitude, @timestamp, @sync_status)';

      await pool.request()
        .input('name', sql.VarChar, name)
        .input('latitude', sql.Decimal(9, 6), latitude)
        .input('longitude', sql.Decimal(9, 6), longitude)
        .input('timestamp', sql.DateTime, adjustedTimestamp) 
        .input('sync_status', sql.Int, 1)
        .query(query);
    }

    res.status(200).json({ message: 'Dados recebidos e salvos com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar os dados no SQL Server:', error);
    res.status(500).json({ message: 'Erro ao salvar os dados' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
