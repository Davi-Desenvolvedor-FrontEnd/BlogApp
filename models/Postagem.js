const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categoria",
        required: true
    },
    autor: {
        type: Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('postagem', Postagem)