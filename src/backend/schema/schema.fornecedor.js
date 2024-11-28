const mongoose = require('mongoose');

const fornecedorSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },  // Unique pode ser importante para emails
    telefone: { type: String, required: true },
    estoque: {type: mongoose.Schema.Types.ObjectId, ref: 'Estoque'}
});

module.exports = mongoose.model('Fornecedor', fornecedorSchema);
