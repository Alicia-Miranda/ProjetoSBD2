document.addEventListener('DOMContentLoaded', () => {
    const fornecedorForm = document.getElementById('fornecedorForm');
    const visualizarBtn = document.getElementById('visualizarFornecedores');
    const voltarBtn = document.getElementById('voltarCadastro');
    const visualizarContainer = document.getElementById('visualizacao-container');
    const productModal = document.getElementById('productModal');
    const closeModalBtn = document.querySelector('.close');
    const addProductBtn = document.getElementById('addProductBtn');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const productForm = document.getElementById('productForm');
    const productList = document.getElementById('productList');
    const fornecedoresLista = document.getElementById('fornecedores-lista');
    const formularioCadastro = document.getElementById('formulario-cadastro');

    let products = [];
    let editingFornecedorId = null;

    // Abrir e fechar modal de adicionar produto
    addProductBtn.addEventListener('click', () => {
        productModal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        productModal.style.display = 'none';
        productForm.reset();
    });

    // Salvar produto
    saveProductBtn.addEventListener('click', () => {
        const produtoNome = document.getElementById('produtoNome').value;
        const produtoMarca = document.getElementById('produtoMarca').value;

        if (produtoNome && produtoMarca) {
            products.push({ nome: produtoNome, marca: produtoMarca });
            const listItem = document.createElement('li');
            listItem.textContent = `${produtoNome} - ${produtoMarca}`;
            productList.appendChild(listItem);
            productModal.style.display = 'none';
            productForm.reset();
        }
    });
    
    document.querySelector('#productList').addEventListener('click', async (e) => {
        if (e.target.tagName === 'BUTTON') {
            const produtoId = e.target.getAttribute('data-id');
            try {
                const response = await fetch(`http://localhost:3333/produtos/${produtoId}`, {
                    method: 'DELETE',
                });
        
                if (!response.ok) {
                    throw new Error('Erro ao remover produto');
                }
        
                // Atualiza a interface após a remoção
                document.getElementById(`produto-${produtoId}`).remove();
                alert('Produto removido com sucesso!');
            } catch (error) {
                console.error(error);
                alert('Erro ao remover o produto.');
            }
            e.stopPropagation(); // Previne a propagação do evento
        }
    });
    // Salvar ou editar fornecedor
    fornecedorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fornecedorData = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value,
            produtos: products,
        };
        
        try {
            let response;
            if (editingFornecedorId) {
                // Edição de fornecedor
                response = await fetch(`http://localhost:3333/fornecedores/${editingFornecedorId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(fornecedorData),
                });
            } else {
                // Cadastro de fornecedor
                response = await fetch('http://localhost:3333/fornecedores', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(fornecedorData),
                });
            }

            if (response.ok) {
                alert('Fornecedor salvo com sucesso!');
                fornecedorForm.reset();
                productList.innerHTML = '';
                editingFornecedorId = null;
                products = [];
                document.getElementById('textTitle').innerHTML = "Editar de Fornecedor"
            } else {
                const error = await response.json();
                alert(`Erro: ${error.error}`);
            }
        } catch (err) {
            alert('Erro ao salvar fornecedor');
        } 
    });

    // Visualizar fornecedores
    visualizarBtn.addEventListener('click', async () => {
        formularioCadastro.style.display = 'none'
        document.getElementById('textTitle').innerHTML = "Cadastro de Fornecedores"
        
        try {
            const response = await fetch('http://localhost:3333/fornecedores');
            const fornecedores = await response.json();

            fornecedoresLista.innerHTML = '';
            fornecedores.forEach((fornecedor) => {
                const row = document.createElement('tr');
                row.id = `fornecedor-${fornecedor.id}`
                row.innerHTML = `
                    <td>${fornecedor.nome}</td>
                    <td>${fornecedor.email}</td>
                    <td>${fornecedor.telefone}</td>
                    <td>${fornecedor.produtos?.map((p) => `${p.nome} - ${p.marca}`).join('<br>') || 'N/A'}</td>
                    <td>
                        <button class="editar" data-id="${fornecedor.id}">Editar</button>
                        <button class="deletar" data-id="${fornecedor.id}">Deletar</button>
                    </td>
                `;

                fornecedoresLista.appendChild(row);
            });

            visualizarContainer.style.display = 'block';
        } catch (error) {
            alert('Erro ao listar fornecedores');
        }
    });

    // Editar fornecedor
    fornecedoresLista.addEventListener('click', async (e) => {
        if (e.target.classList.contains('editar')) {
            const fornecedorId = e.target.dataset.id;
            document.getElementById('textTitle').innerHTML = "Editar de Fornecedor"
            try {
                const response = await fetch(`http://localhost:3333/fornecedores/${fornecedorId}`);
                const fornecedor = await response.json();
                editingFornecedorId = fornecedorId;
                // Preencher o formulário de edição com os dados do fornecedor
                document.getElementById('nome').value = fornecedor.nome;
                document.getElementById('email').value = fornecedor.email;
                document.getElementById('telefone').value = fornecedor.telefone;
                // Adicionar produtos ao formulário de edição
                document.querySelector('#productList').innerHTML = '';
                products = fornecedor.estoque?.produtos || [];
                products.forEach(produto => {
                    const produtoHtml = `
                        <li id="produto-${produto._id}">
                            ${produto.nome} - ${produto.marca}
                            <button type="button" data-id=${produto._id}>Remover</button>
                        </li>`;
                    document.querySelector('#productList').innerHTML += produtoHtml;
                });
                formularioCadastro.style.display = 'block';
                visualizarContainer.style.display = 'none';
            } catch (error) {
                alert('Erro ao carregar fornecedor para edição');
            }
        } else if(e.target.classList.contains('deletar')) {
            const fornecedorId = e.target.dataset.id;
                if (confirm("Deseja excluir este fornecedor?")) {
                    try {
                       await fetch(`http://localhost:3333/fornecedores/${fornecedorId}`, { method: 'DELETE' })
                       alert('Fornecedor excluído!');
                    } catch (error) {
                        alert('Erro ao excluir fornecedor!');
                    } finally{
                        document.getElementById(`fornecedor-${fornecedorId}`).remove();
                    }
                   
                }
        }
    });

    // Voltar ao cadastro
    voltarBtn.addEventListener('click', () => {
        document.getElementById('textTitle').innerHTML = "Cadastro de Fornecedores"
        visualizarContainer.style.display = 'none';
        formularioCadastro.style.display = 'block'
        fornecedorForm.reset();
        productList.innerHTML = '';
        products = [];
    });

});
