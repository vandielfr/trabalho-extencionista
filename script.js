// Dados persistidos no localStorage
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let vendas = JSON.parse(localStorage.getItem("vendas")) || [];
let servicos = JSON.parse(localStorage.getItem("servicos")) || [];

// Navegação entre seções
function mostrarSecao(id, botao) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".menu button").forEach(b => b.classList.remove("active"));
  botao.classList.add("active");

  const nomes = {
    dashboard: "Dashboard",
    clientes: "Clientes",
    produtos: "Produtos",
    estoque: "Estoque",
    vendas: "Vendas",
    servicos: "Assistência Técnica"
  };

  document.getElementById("tituloPagina").innerText = nomes[id];
  listarTudo();
  document.getElementById("sidebar").classList.remove("open");
}

function abrirMenu() {
  document.getElementById("sidebar").classList.toggle("open");
}

// Modais
function abrirModalCliente() {
  document.getElementById("modalCliente").classList.add("show");
}

function abrirModalProduto() {
  document.getElementById("modalProduto").classList.add("show");
}

function abrirModalVenda() {
  atualizarSelects();
  document.getElementById("modalVenda").classList.add("show");
}

function abrirModalServico() {
  atualizarSelects();
  document.getElementById("modalServico").classList.add("show");
}

function fecharModal(id) {
  document.getElementById(id).classList.remove("show");
}

// Clientes
function salvarCliente(e) {
  e.preventDefault();

  clientes.push({
    id: Date.now(),
    nome: document.getElementById("clienteNome").value.trim(),
    telefone: document.getElementById("clienteTelefone").value.trim(),
    cpf: document.getElementById("clienteCpf").value.trim(),
    cidade: document.getElementById("clienteCidade").value.trim(),
    endereco: document.getElementById("clienteEndereco").value.trim()
  });

  localStorage.setItem("clientes", JSON.stringify(clientes));
  e.target.reset();
  fecharModal("modalCliente");
  listarTudo();
  alert("Cliente cadastrado com sucesso!");
}

function listarClientes() {
  const t = document.getElementById("tabelaClientes");
  const b = document.getElementById("buscarCliente").value.toLowerCase();
  t.innerHTML = "";

  clientes
    .filter(c => c.nome.toLowerCase().includes(b))
    .forEach(c => {
      t.innerHTML += `
        <tr>
          <td>${c.nome}</td>
          <td>${c.telefone}</td>
          <td>${c.cpf || "-"}</td>
          <td>${c.cidade || "-"}</td>
          <td>
            <button class="btn btn-red" onclick="excluirCliente(${c.id})">Excluir</button>
          </td>
        </tr>`;
    });
}

function excluirCliente(id) {
  if (!confirm("Deseja realmente excluir este cliente?")) return;
  clientes = clientes.filter(c => c.id !== id);
  localStorage.setItem("clientes", JSON.stringify(clientes));
  listarTudo();
}

// Produtos
function salvarProduto(e) {
  e.preventDefault();

  produtos.push({
    id: Date.now(),
    nome: document.getElementById("produtoNome").value.trim(),
    categoria: document.getElementById("produtoCategoria").value,
    preco: Number(document.getElementById("produtoPreco").value),
    custo: Number(document.getElementById("produtoCusto").value) || 0,
    estoque: Number(document.getElementById("produtoEstoque").value)
  });

  localStorage.setItem("produtos", JSON.stringify(produtos));
  e.target.reset();
  fecharModal("modalProduto");
  listarTudo();
  alert("Produto cadastrado com sucesso!");
}

function listarProdutos() {
  const t = document.getElementById("tabelaProdutos");
  const b = document.getElementById("buscarProduto").value.toLowerCase();
  t.innerHTML = "";

  produtos
    .filter(p => p.nome.toLowerCase().includes(b))
    .forEach(p => {
      const s = p.estoque <= 3
        ? '<span class="status low">Estoque baixo</span>'
        : '<span class="status ok">Disponível</span>';

      t.innerHTML += `
        <tr>
          <td>${p.nome}</td>
          <td>${p.categoria}</td>
          <td>R$ ${p.preco.toFixed(2)}</td>
          <td>${p.estoque} ${s}</td>
          <td>
            <button class="btn btn-red" onclick="excluirProduto(${p.id})">Excluir</button>
          </td>
        </tr>`;
    });
}

function excluirProduto(id) {
  if (!confirm("Deseja excluir este produto?")) return;
  produtos = produtos.filter(p => p.id !== id);
  localStorage.setItem("produtos", JSON.stringify(produtos));
  listarTudo();
}

// Estoque
function listarEstoque() {
  const t = document.getElementById("tabelaEstoque");
  t.innerHTML = "";

  produtos.forEach(p => {
    const s = p.estoque <= 3
      ? '<span class="status low">Comprar</span>'
      : '<span class="status ok">Normal</span>';

    t.innerHTML += `
      <tr>
        <td>${p.nome}</td>
        <td>${p.categoria}</td>
        <td>${p.estoque}</td>
        <td>${s}</td>
      </tr>`;
  });
}

// Selects de cliente e produto
function atualizarSelects() {
  const sc = document.getElementById("vendaCliente");
  const so = document.getElementById("osCliente");
  const sp = document.getElementById("vendaProduto");

  sc.innerHTML = so.innerHTML = '<option value="">Selecione o cliente</option>';
  sp.innerHTML = '<option value="">Selecione o produto</option>';

  clientes.forEach(c => {
    const o = `<option value="${c.id}">${c.nome}</option>`;
    sc.innerHTML += o;
    so.innerHTML += o;
  });

  produtos.forEach(p => {
    sp.innerHTML += `<option value="${p.id}">${p.nome} - R$ ${p.preco.toFixed(2)}</option>`;
  });
}

// Vendas
function salvarVenda(e) {
  e.preventDefault();

  const cid = Number(document.getElementById("vendaCliente").value);
  const pid = Number(document.getElementById("vendaProduto").value);
  const q = Number(document.getElementById("vendaQuantidade").value);

  const c = clientes.find(x => x.id === cid);
  const p = produtos.find(x => x.id === pid);

  if (!c || !p) {
    alert("Selecione cliente e produto.");
    return;
  }

  if (p.estoque < q) {
    alert("Estoque insuficiente!");
    return;
  }

  p.estoque -= q;

  vendas.push({
    id: Date.now(),
    data: new Date().toLocaleString("pt-BR"),
    cliente: c.nome,
    produto: p.nome,
    quantidade: q,
    valor: p.preco * q,
    pagamento: document.getElementById("vendaPagamento").value
  });

  localStorage.setItem("vendas", JSON.stringify(vendas));
  localStorage.setItem("produtos", JSON.stringify(produtos));

  e.target.reset();
  fecharModal("modalVenda");
  listarTudo();
  alert("Venda registrada com sucesso!");
}

function listarVendas() {
  const t = document.getElementById("tabelaVendas");
  t.innerHTML = "";

  vendas.slice().reverse().forEach(v => {
    t.innerHTML += `
      <tr>
        <td>${v.data}</td>
        <td>${v.cliente}</td>
        <td>${v.produto} (${v.quantidade})</td>
        <td>R$ ${v.valor.toFixed(2)}</td>
      </tr>`;
  });
}

// Assistência Técnica (OS)
function salvarServico(e) {
  e.preventDefault();

  const cid = Number(document.getElementById("osCliente").value);
  const c = clientes.find(x => x.id === cid);

  servicos.push({
    numero: servicos.length + 1,
    cliente: c ? c.nome : "",
    aparelho: document.getElementById("osAparelho").value.trim(),
    defeito: document.getElementById("osDefeito").value.trim(),
    servico: document.getElementById("osServico").value.trim(),
    valor: Number(document.getElementById("osValor").value) || 0,
    status: "Aguardando"
  });

  localStorage.setItem("servicos", JSON.stringify(servicos));
  e.target.reset();
  fecharModal("modalServico");
  listarTudo();
  alert("Ordem de serviço criada!");
}

function listarServicos() {
  const t = document.getElementById("tabelaServicos");
  t.innerHTML = "";

  servicos.slice().reverse().forEach(o => {
    t.innerHTML += `
      <tr>
        <td>OS-${String(o.numero).padStart(4, "0")}</td>
        <td>${o.cliente}</td>
        <td>${o.aparelho}</td>
        <td>${o.defeito}</td>
        <td><span class="status low">${o.status}</span></td>
      </tr>`;
  });
}

// Dashboard
function atualizarDashboard() {
  document.getElementById("totalClientes").innerText = clientes.length;
  document.getElementById("totalProdutos").innerText = produtos.length;
  document.getElementById("totalVendas").innerText = vendas.length;
  document.getElementById("estoqueBaixo").innerText = produtos.filter(p => p.estoque <= 3).length;
}

function listarTudo() {
  listarClientes();
  listarProdutos();
  listarEstoque();
  listarVendas();
  listarServicos();
  atualizarDashboard();
}

function atualizarData() {
  document.getElementById("dataAtual").innerText = new Date().toLocaleDateString("pt-BR");
}

// Fechar modal ao clicar fora
document.querySelectorAll(".modal").forEach(m => {
  m.addEventListener("click", e => {
    if (e.target === m) m.classList.remove("show");
  });
});

// Inicialização
atualizarData();
listarTudo();
