const express = require('express');
const app = express ();
const mysql = require('mysql2');
const { engine } = require('express-handlebars');


app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/bootstrap-icons', express.static(__dirname + '/node_modules/bootstrap-icons'));
app.use('/static', express.static(__dirname + '/static'));
app.use(express.urlencoded({extended: true}));

const session = require('express-session');
const bycrypt = require('bcrypt');
app.use(session({
    secret: 'chave-secreta-ultra-segura',
    resave: false,
    saveUninitialized: false, 
    cookie: { maxAge: 3600000 }
}));

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
    let sql = 'SELECT * FROM produtos';
    conexao.query(sql, function (erro, produtos_qs){
        if (erro) {
            console.error('Erro ao consultar produtos: ' , erro);
            res.status(500).send('Erro ao Consultar produtos');
            return;
        }
        res.render('index', { produtos: produtos_qs});
    });
}
);

app.post('/produtos/add', (req, res) => {
    const {nome, descricao, preco, estoque, categoria_id} = req.body;

    const sql = `INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id)
    VALUES (?, ?, ?, ?, ?)
    `;
    conexao.query(sql, [nome, descricao, preco, estoque, categoria_id], (erro,resultado) => {
        if (erro) {
            console.error ('Erro ao Inserir produto' , erro);
            return res.status(500).send('Erro ao Adcionar Produto');
    }

    res.redirect('/');
    });
});

app.get('/produtos/add', (req, res) => {
  let sql = 'SELECT cod_id, nome FROM categorias';

  conexao.query(sql, function (erro, categoria_qs) {
    if (erro) {
      console.error('😫 Erro ao consultar categorias:', erro);
      res.status(500).send('Erro ao consultar categorias');
      return;
    }

    res.render('produto_form', { categorias: categoria_qs });
  });
});

app.post('/categorias/add', (req, res) => {
    const {nome, descricao} = req.body;

    const sql = `INSERT INTO categorias (nome, descricao)
    VALUES (?, ?)
    `;
    conexao.query(sql, [nome, descricao], (erro,resultado) => {
        if (erro) {
            console.error ('Erro ao Inserir Categoria' , erro);
            return res.status(500).send('Erro ao Adcionar Categoria');
    }

    res.redirect('/');
    });
});

app.get('/categorias/add', (req, res) => {
    res.render('categoria_form');
  });


  app.get ('/produtos/:id' , (req, res) => {
    const id = req.params.id;
    const sql = 
    ` SELECT produtos.*, 
        categorias.nome AS categoria_nome
    FROM produtos
    JOIN categorias ON produtos.categoria_id = cod_id 
    WHERE produtos.id = ?`

    conexao.query (sql, [id], function (erro, produto_qs) {
        if (erro) {
            console.error('Erro ao consultar produto', erro);
            res.status(500).send('Erro ao Consultar produto');
            return;
        }
        if (produto_qs.length === 0) {
            return res.status(404).send('Produto nao encontrado');
        }
        res.render('produtos' , {produto: produto_qs[0] });
    });
  });

  app.get('/categorias', (req, res) => {
    let sql = 'SELECT * FROM categorias';
    conexao.query(sql, function (erro, categoria_qs){
        if (erro) {
            console.error('Erro ao consultar categorias: ' , erro);
            res.status(500).send('Erro ao Consultar categorias');
            return;
        }
        res.render('categoria_mostrar', { categorias: categoria_qs});
    });
}
);

  app.get('/clientes', (req, res) => {
        res.render('cadastro_form');
    });


app.post('/clientes/cadastrar', (req, res) => {
    const {nome, email, senha, endereco} = req.body;

    bycrypt.hash(senha, 10, (erro, hash) => {
        if (erro) {
            console.error('Erro ao Criptografar a senha: ', erro);
            return res.status(500).send('Erro interno no servidor. ');
        }

        const sqlUsuario = 'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)';
        conexao.query(sqlUsuario, [nome, email, hash, 'comum'], (erro, resultado) => {
            if (erro){
                console.error ('Erro ao inserir usuario', erro);
                return res.status(500).send('Erro ao cadastrar usuario');
            }

            const usuario_id = resultado.insertId;
            const sqlCLiente = 'INSERT INTO clientes (nome, email, senha, endereco) VALUES (?, ?, ?, ?)';
            conexao.query(sqlCLiente, [nome, endereco, usuario_id], (erro2) =>{
                if (erro2) {
                    console.error ('Erro inserir cliente', erro2);
                    return res.status(500).send('Erro cadastrar cliente');
                }

                res.redirect ('/login');
            });
        });
    });
});


app.listen(8080);

