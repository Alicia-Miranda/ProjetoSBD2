const express = require('express');
const mongoose = require('../backend/database/db.js');
const Estoque = require('../backend/schema/schema.estoque.js');
const Produto = require('../backend/schema/schema.produto.js');
const Fornecedor = require('../backend/schema/schema.fornecedor.js');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/fornecedores', async (req, res) => {
    const { nome, email, telefone, produtos } = req.body;

    try {
        // Cria um novo estoque
        const novoEstoque = await new Estoque({
            quantidade: 0, // Inicialmente, estoque com 0 quantidade
            produtos: []   // Lista vazia para produtos inicialmente
        }).save();

        // Cria produtos e associa ao estoque
        const produtoIds = await Promise.all(
            produtos.map(async (produto) => {
                const novoProduto = await new Produto({
                    nome: produto.nome,
                    marca: produto.marca,
                    estoque: novoEstoque._id
                }).save();
                return novoProduto._id;
            })
        );

        // Atualiza o estoque com os produtos criados
        novoEstoque.produtos = produtoIds;
        await novoEstoque.save();

        // Cria o fornecedor e associa o estoque
        const fornecedor = new Fornecedor({
            nome,
            email,
            telefone,
            estoque: novoEstoque._id,
        });
        await fornecedor.save();

        res.status(201).send(fornecedor);
    } catch (error) {
        console.error('Erro ao criar fornecedor:', error);
        res.status(400).send({ error: 'Erro ao criar fornecedor' });
    }
});


app.get('/fornecedores', async (req, res) => {
    try {
        const fornecedores = await Fornecedor.find()
            .populate({
                path: 'estoque',
                populate: {
                    path: 'produtos',
                },
            });
        // Processar dados antes de enviar
        const formattedFornecedores = fornecedores.map(fornecedor => ({
            id: fornecedor._id,
            nome: fornecedor.nome,
            email: fornecedor.email,
            telefone: fornecedor.telefone,
            produtos: fornecedor.estoque?.produtos || [],
        }));

        res.status(200).send(formattedFornecedores);
    } catch (error) {
        console.error('Erro ao listar fornecedores:', error);
        res.status(400).send({ error: 'Erro ao listar fornecedores' });
    }
});

app.get('/fornecedores/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const fornecedor = await Fornecedor.findById(id).populate({
            path: 'estoque',
            populate: {
                path: 'produtos',
            },
        });

        if (!fornecedor) {
            return res.status(404).send({ error: 'Fornecedor não encontrado' });
        }

        res.status(200).send(fornecedor);
    } catch (error) {
        res.status(400).send({ error: 'Erro ao buscar fornecedor' });
    }
});

app.delete('/fornecedores/:id', async (req, res) => {
    try {
        const fornecedor = await Fornecedor.findById(req.params.id);
        if (!fornecedor) {
            return res.status(404).send({ error: 'Fornecedor não encontrado' });
        }

        await Estoque.findByIdAndDelete(fornecedor.estoque);
        await Produto.deleteMany({ estoque: fornecedor.estoque });

        await fornecedor.deleteOne();
        res.send('Fornecedor e seus dados associados foram excluídos!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao excluir fornecedor');
    }
});

app.put('/fornecedores/:id', async (req, res) => {
    const { nome, email, telefone, produtos } = req.body; 

    try {
        const fornecedor = await Fornecedor.findById(req.params.id);

        if (!fornecedor) {
            return res.status(404).send({ error: 'Fornecedor não encontrado' });
        }

        fornecedor.nome = nome || fornecedor.nome;
        fornecedor.email = email || fornecedor.email;
        fornecedor.telefone = telefone || fornecedor.telefone;

        if (produtos && produtos.length > 0) {
            const estoque = await Estoque.findById(fornecedor.estoque);

            if (!estoque) {
                return res.status(404).send({ error: 'Estoque do fornecedor não encontrado' });
            }

            const novosProdutosIds = [];
            for (const produto of produtos) {
                const novoProduto = await new Produto({
                    nome: produto.nome,
                    marca: produto.marca,
                    estoque: estoque._id,
                }).save();

                novosProdutosIds.push(novoProduto._id);
            }

            estoque.produtos.push(...novosProdutosIds);
            estoque.quantidade += novosProdutosIds.length; 
            await estoque.save();
        }

        await fornecedor.save();
        res.status(200).send(fornecedor);
    } catch (error) {
        res.status(400).send({ error: 'Erro ao atualizar fornecedor: ' + error.message });
    }
});

app.delete('/produtos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Encontra e remove o produto
        const produto = await Produto.findByIdAndDelete(id);

        if (!produto) {
            return res.status(404).send({ error: 'Produto não encontrado' });
        }

        // Remove o produto do estoque
        await Estoque.findByIdAndUpdate(produto.estoque, {
            $pull: { produtos: id }, // Remove o ID do produto da lista de produtos no estoque
        });

        res.status(200).send({ message: 'Produto removido com sucesso' });
    } catch (error) {
        res.status(400).send({ error: 'Erro ao remover produto' });
    }
});

const PORT = 3333;
const HOST = "localhost";
app.listen(PORT, HOST, () => console.info(`Servidor rodando na http://${HOST}:${PORT}`));
