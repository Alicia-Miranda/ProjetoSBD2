const express = require('express');
const mongoose = require('../backend/database/db.js');
const Fornecedor = require('../backend/models/fornecedor');
const cors = require('cors'); // Adicionando CORS
const app = express();

app.use(cors()); // Habilitando CORS para aceitar requisições de outros domínios
app.use(express.json());

// Rota para listar fornecedores
app.post('/fornecedores', async (req, res) => {
    const {nome, email, telefone, tipoProduto} = req.body
    try {
        const fornecedor = new Fornecedor({nome, email, telefone, tipoProduto});
        await fornecedor.save();
        res.status(201).send(fornecedor);
    } catch (error) {
        res.status(400).send({ error: 'Erro ao salvar fornecedor' });
    }
});
app.get('/fornecedores', async (req, res) => {
    try {
        const fornecedores = await Fornecedor.find()
        res.status(200).send(fornecedores.map((fornecedor) => ({
            nome: fornecedor.nome,
            email: fornecedor.email,
            telefone: fornecedor.telefone,
            tipoProduto: fornecedor.tipoProduto,
            id: fornecedor._id,
        })))
    
    } catch (error) {
        res.status(400).send({ error: 'Erro ao listar fornecedores' });
        
    }
})
// Rota para excluir fornecedor
app.delete('/fornecedores/:id', async (req, res) => {
    try {
        const fornecedor = await Fornecedor.findByIdAndDelete(req.params.id);
        if (!fornecedor) {
            return res.status(404).send({ error: 'Fornecedor não encontrado' });
        }
        res.send('Fornecedor excluído!');
    } catch (err) {
        res.status(500).send('Erro ao excluir fornecedor');
    }
});
// Rota para editar fornecedor
app.put('/fornecedores/:id', async (req, res) => {
    try {
        // Atualizar o fornecedor pelo ID
        const fornecedor = await Fornecedor.findByIdAndUpdate(
            req.params.id,        // ID do fornecedor (extraído da URL)
            req.body,             // Dados atualizados (do corpo da requisição)
            { new: true, runValidators: true } // Retorna o documento atualizado e valida os campos
        );

        // Verifica se o fornecedor foi encontrado
        if (!fornecedor) {
            return res.status(404).send({ error: 'Fornecedor não encontrado' });
        }

        // Retorna o fornecedor atualizado
        res.send(fornecedor);
    } catch (error) {
        res.status(400).send({ error: 'Erro ao atualizar fornecedor' });
    }
});


// Servidor
const PORT = 3333
const HOST = "localhost"
app.listen(PORT, HOST, () => console.info(`Servidor rodando na http://${HOST}:${PORT}`));

