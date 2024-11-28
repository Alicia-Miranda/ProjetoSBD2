const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    marca: { type: String, required: true },
    estoque: { type: mongoose.Schema.Types.ObjectId, ref: 'Estoque' }
})

module.exports = mongoose.model('Produto', produtoSchema);
