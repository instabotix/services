//Documento principal da aplicação do Bot
// Iniciando o servidor express JS
const express = require('express');
const app = express();

//o cors permite compartilhar recursos entre diferentes endereços http
const cors = require('cors');
app.use(cors()) //definindo o cors como um middleware

//habilitando para trabalhar com dados em JSON
app.use(express.json())

app.listen(3000)
