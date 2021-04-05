// Documento principal da aplicação do bot
// Iniciando o servidor Express JS
const express = require("express");
const app = express();


// O cors permite compartilhar recursos entre diferentes endereços http
const cors = require("cors");
app.use(cors()); //definindo o cors como um middleware


// Obtendo as variáveis do ambiente
const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://user:password@localhost/produtos";


// Configurando o banco de dados
const mongoose = require("mongoose");
mongoose.connect(MONGODB_URL, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Mensagem de erro
mongoose.connection.on("error", (err) => {
    console.log("Erro no banco de dados " + err);
});

const produtoSchema = mongoose.Schema({
    media_id: String,
    produtos: [String]
}, {collection: "produtos"});

const Produtos = mongoose.model("Produtos", produtoSchema);


// Habilitando para trabalhar com dados em JSON
app.use(express.json());


// Rotas
app.put("/produtos", (req, res, next) => {
    Produtos.create(req.body).then((produto) => {
        res.send(produto);
    }).catch(next);
});

app.get("/produtos/:media_id", (req, res, next) => {
    Produtos.findOne({media_id: req.params.media_id}).then((produto) => {
        res.send(produto);
    }).catch(next);
});

app.post("/produtos/:media_id", (req, res, next) => {
    Produtos.findOneAndUpdate({media_id: req.params.media_id}, req.body).then(() => {
        Produtos.findOne({media_id: req.params.media_id}).then((produto) => {
            res.send(produto);
        }).catch(next);
    }).catch(next);
});

app.delete("/produtos/:media_id", (req, res, next) => {
    const media_id = req.params.media_id;
    Produtos.findOneAndRemove({media_id: req.params.media_id}).then((produto) => {
        res.send(produto);
    }).catch(next);
});

app.use((err, req, res, next) => {
    res.status(422).send({erro: err.message});
});

app.listen(PORT);
