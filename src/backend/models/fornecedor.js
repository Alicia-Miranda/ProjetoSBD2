const mongoose = require('mongoose');

const fornecedorSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },  // Unique pode ser importante para emails
    telefone: { type: String, required: true },
    tipoProduto: { type: String, required: true }
});

module.exports = mongoose.model('Fornecedor', fornecedorSchema);
