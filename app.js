const API = "https://atelier-backend-ew43.onrender.com";

// ==========================
// ESTADO
// ==========================
let token = localStorage.getItem("token");
let produtoAtual = null;
let indiceImagem = 0;

// ==========================
// NAVEGAÇÃO
// ==========================
function mostrarPagina(id) {
  document.querySelectorAll(".pagina").forEach(p => {
    p.style.display = "none";
  });

  const pagina = document.getElementById(id);
  if (pagina) pagina.style.display = "block";
}

// ==========================
// LOAD
// ==========================
window.onload = async () => {
  fetch(`${API}/stats/visit`, { method: "POST" });
  await carregarFotos();
  mostrarPagina("galeria");
  await verificarUsuario();
};

// ==========================
// LOGIN
// ==========================
const loginForm = document.getElementById("login-form");
const loginErro = document.getElementById("loginErro");

if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();

    const email = loginForm.loginEmail.value;
    const password = loginForm.loginSenha.value;

    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      loginErro.textContent = "Email ou senha inválidos";
      return;
    }

    token = data.access_token;
    localStorage.setItem("token", token);

    await verificarUsuario();
    mostrarPagina("galeria");
    carregarFotos();
  });
}

// ==========================
// GALERIA (AGRUPADA)
// ==========================
async function carregarFotos() {
  const lista = document.getElementById("listaFotos");
  if (!lista) return;

  const res = await fetch(`${API}/photos`);
  const fotos = await res.json();

  lista.innerHTML = "";

  const produtos = agruparProdutos(fotos);

  produtos.forEach(produto => {
    const card = document.createElement("div");
    card.className = "produto-card";

    card.innerHTML = `
      <img src="${produto.imagens[0]}" />
      <h4>${produto.titulo}</h4>
    `;

    card.onclick = () => abrirModalProduto(produto);
    lista.appendChild(card);
  });
}

// ==========================
// AGRUPAR POR PRODUTO
// ==========================
function agruparProdutos(fotos) {
  const map = {};

  fotos.forEach(f => {
    const linhas = f.description?.split("\n") || [];
    const titulo = linhas[0] || "Produto artesanal";
    const descricao = linhas.slice(1).join("\n");

    if (!map[titulo]) {
      map[titulo] = {
        titulo,
        descricao,
        imagens: []
      };
    }

    map[titulo].imagens.push(f.url);
  });

  return Object.values(map);
}

// ==========================
// MODAL COM SWIPE
// ==========================
function abrirModalProduto(produto) {
  produtoAtual = produto;
  indiceImagem = 0;

  atualizarModal();

  document.getElementById("modal-produto").classList.remove("hidden");
}

function atualizarModal() {
  document.getElementById("modal-img").src =
    produtoAtual.imagens[indiceImagem];

  document.getElementById("modal-titulo").textContent =
    produtoAtual.titulo;

  document.getElementById("modal-desc").textContent =
    produtoAtual.descricao;

  const whatsapp = "5516974054147"; // troque se quiser
  const msg = encodeURIComponent(
    `Olá! Gostaria de um orçamento sobre:\n${produtoAtual.titulo}`
  );

  document.getElementById("modal-whatsapp").href =
    `https://wa.me/${whatsapp}?text=${msg}`;
}

function proximaImagem() {
  indiceImagem =
    (indiceImagem + 1) % produtoAtual.imagens.length;
  atualizarModal();
}

function imagemAnterior() {
  indiceImagem =
    (indiceImagem - 1 + produtoAtual.imagens.length) %
    produtoAtual.imagens.length;
  atualizarModal();
}

function fecharModal() {
  document.getElementById("modal-produto").classList.add("hidden");
}

// ==========================
// LOGOUT
// ==========================
document.getElementById("btnLogout")?.addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});

// ==========================
// VERIFICA ADMIN
// ==========================
async function verificarUsuario() {
  if (!token) return;

  const res = await fetch(`${API}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const me = await res.json();

  if (me.role === "admin") ativarModoAdmin();
}

function ativarModoAdmin() {
  const nav = document.querySelector(".navbar");

  if (!document.getElementById("btn-admin")) {
    const btn = document.createElement("button");
    btn.id = "btn-admin";
    btn.textContent = "Painel Admin";
    btn.onclick = () =>
      (window.location.href = "/Persona/admin.html");
    nav.appendChild(btn);
  }
}
