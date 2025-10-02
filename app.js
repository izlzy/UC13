const express = require('express');
const app = express ();
const mysql = require('mysql2');

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'senac',
    port: 3306,
    database: 'ecommerce_pc'
});


conexao.connect((erro) => {
    if (erro) {
        console.error('Erro ao Conectar ao Banco de dados', erro);
        return;
    }
    console.log('Conexao com o bando de dados estabelecida com sucesso!');
});

app.listen(8080);

