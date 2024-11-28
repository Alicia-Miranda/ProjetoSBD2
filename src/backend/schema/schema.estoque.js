const mongoose = require('mongoose');

const estoqueSchema = new mongoose.Schema({
    quantidade: Number,
    produtos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Produto' }],
})

module.exports = mongoose.model('Estoque', estoqueSchema);