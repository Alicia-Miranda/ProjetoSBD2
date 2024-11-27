document.addEventListener("DOMContentLoaded", () => {
    const titulo = document.getElementById("titulo");
    const formContainer = document.getElementById("formulario-container");
    const viewContainer = document.getElementById("visualizacao-container");
    const form = document.getElementById("fornecedorForm");
    const tabela = document.getElementById("fornecedores-lista");
    const btnVisualizar = document.getElementById("visualizarFornecedores");
    const btnVoltar = document.getElementById("voltarCadastro");
    const btnSalvar = document.getElementById("btnSalvar");

    const serverUrl = "http://localhost:3333";
    let fornecedores = [];
    let editando = null;

    // Alternar para a tela de visualização
    btnVisualizar.addEventListener("click", () => {
        formContainer.style.display = "none";
        viewContainer.style.display = "block";
        titulo.textContent = "Lista de Fornecedores"; // Alterar título
        atualizarTabela();
    });

    // Voltar ao formulário
    btnVoltar.addEventListener("click", () => {
        viewContainer.style.display = "none";
        document.getElementById("email").disabled = false;
        formContainer.style.display = "block";
        titulo.textContent = "Cadastro de Fornecedores"; // Alterar título
    });

    // Salvar ou atualizar fornecedor
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const telefone = document.getElementById("telefone").value;
        const tipoProduto = document.getElementById("tipoProduto").value;

        if (emailExiste(email) && editando === null) {
            alert("O email já está cadastrado!");
            return;
        }

        if (editando !== null) {
           
            btnSalvar.textContent = "Salvar";
            try {
               await fetch(`${serverUrl}/fornecedores/${editando}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nome, telefone, tipoProduto })
                });
                alert("Fornecedor editado com sucesso! ✔");
            } catch (error) {
                alert('Erro ao editar fornecedor');
            } finally{
                editando = null;
            }
        } else {
             try {
                await fetch(`${serverUrl}/fornecedores`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nome, email, telefone, tipoProduto })
                });
                    alert("Fornecedor salvo com sucesso! ✔");
             } catch (error) {
                alert('Erro ao cadastrar fornecedor');
             }

        }
        document.getElementById("email").disabled = false;
        form.reset();
        
    });

    // Validar emails duplicados
    const emailExiste = (email) => fornecedores.some((f) => f.email === email);

    // Atualizar tabela
    const atualizarTabela = async () => {
        tabela.innerHTML = "";
        //
        try {
        const response = await fetch(`${serverUrl}/fornecedores`)
        if (response.ok) {
            fornecedores = await response.json()
            fornecedores.forEach((fornecedor) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${fornecedor.nome}</td>
                    <td>${fornecedor.email}</td>
                    <td>${fornecedor.telefone}</td>
                    <td>${fornecedor.tipoProduto}</td>
                    <td>
                        <button class="editar" data-index="${fornecedor.id}">Editar</button>
                        <button class="excluir" data-index="${fornecedor.id}">Excluir</button>
                    </td>
                `;
                tabela.appendChild(tr);
            });
    
        } 
    } catch (error) {
        console.error('Erro ao carregar fornecedores');
    }

        document.querySelectorAll(".editar").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                editarFornecedor(index);
            })
        );

        document.querySelectorAll(".excluir").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                excluirFornecedor(index);
            })
        );
    };

    // Editar fornecedor
    const editarFornecedor = (fornecedorId) => {
        const fornecedor = fornecedores.find(fornecedor => fornecedor.id === fornecedorId);
        document.getElementById("nome").value = fornecedor.nome;
        document.getElementById("email").value = fornecedor.email;
        document.getElementById("email").disabled = true;
        document.getElementById("telefone").value = fornecedor.telefone;
        document.getElementById("tipoProduto").value = fornecedor.tipoProduto;

        editando = fornecedorId;
        btnSalvar.textContent = "Atualizar";
        viewContainer.style.display = "none";
        formContainer.style.display = "block";
        titulo.textContent = "Cadastro de Fornecedores";
    };

    // Excluir fornecedor
    const excluirFornecedor = async (fornecedorId) => {
        if (confirm("Deseja excluir este fornecedor?")) {
            try {
               await fetch(`${serverUrl}/fornecedores/${fornecedorId}`, { method: 'DELETE' })
               alert('Fornecedor excluído!');
            } catch (error) {
                alert('Erro ao excluir fornecedor!');
            } finally{
                atualizarTabela();
            }
           
        }
    };
});
