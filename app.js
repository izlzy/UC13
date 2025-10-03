const express = require('express');
const app = express ();
const mysql = require('mysql2');
const { engine } = require('express-handlebars');

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));

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


app.get('/', (req, res) => {
    res.render('index');
}
);

app.listen(8080);

