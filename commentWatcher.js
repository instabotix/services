const Instagram = require('instagram-web-api');
const mongoose = require('mongoose');


// Obtendo as variáveis de ambiente
const MONGOBD_URL = process.env.MONGODB_URL;
const [ username, password ] = [process.env.INSTAGRAM_USERNAME, process.env.INSTAGRAM_PASSWORD];


// Configurando o banco de dados
mongoose.connect(MONGOBD_URL, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('error', (err) => {
    console.log('Erro no banco de dados ' + err);
});

// Esquema da coleção que registra os comentários que já foram encaminhados para o chatbot
const comentarioSchema = new mongoose.Schema({
    comentario: {type: String, unique: true}
}, {collection: 'comentarios'});

// Registra o modelo no banco de dados
const Comentarios = mongoose.model('Comentarios', comentarioSchema);


// Biblioteca da API não-oficial do Instagram
const client = new Instagram({username, password});

(async () => {
    await client.login();
    const atividade = await client.getActivity();
    const notificacoes = atividade.activity_feed.edge_web_activity_feed.edges;

    notificacoes.forEach((notificacao) => {
        // Seleciona apenas as notificação referentes a comentários
        if (notificacao.node.__typename === 'GraphCommentMediaStory') {
            const comentario_id = notificacao.node.id.split('_').slice(1).join('_');
            // Procura no banco de dados se o comentário já foi endereçado
            Comentarios.find({comentario: comentario_id}, (err, doc) => {
                if (doc.length === 0) {
                    // Seleciona os detelhes do comentário para enviar para o chatbot
                    Comentarios.create({comentario: comentario_id}, (err, doc) => {
                        let comentario = {
                            comentario_id: comentario_id,
                            timestamp: notificacao.node.timestamp,
                            usuario: {
                                id: notificacao.node.user.id,
                                usuario: notificacao.node.user.username,
                                nome_completo: notificacao.node.user.full_name
                            },
                            media_id:  notificacao.node.media.shortcode,
                            comentario: notificacao.node.text
                        }
                        console.log(comentario);
                    });
                }
            });
        }
    });
})();
