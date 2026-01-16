const API = "https://atelier-backend-ew43.onrender.com";

// ==========================
// ESTADO
// ==========================
let token = localStorage.getItem("token");
let produtoAtual = null;
let indiceImagem = 0;
let startX = 0;

// ==========================
// NAVEGAÇÃO
// ==========================
function mostrarPagina(id) {
  document.querySelectorAll(".pagina").forEach(p => {
    p.style.display = "none";
  });

  document.getElementById(id)?.style.setProperty("display", "block");
}

// ==========================
// LOAD
// ==========================
window.onload = async () => {
  fetch(`${API}/stats/visit`, { method: "POST" });
  await carregarProdutos();
  mostrarPagina("galeria");
  await verificarUsuario();
};

// ==========================
// LOGIN
// ==========================
const loginForm = document.getElementById("login-form");
const loginErro = document.getElementById("loginErro");

loginForm?.addEventListener("submit", async e => {
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
  carregarProdutos();
});

// ==========================
// GALERIA (PRODUTOS)
// ==========================
async function carregarProdutos() {
  const lista = document.getElementById("listaFotos");
  if (!lista) return;

  const res = await fetch(`${API}/products`);
  const produtos = await res.json();

  lista.innerHTML = "";

  produtos.forEach(produto => {
    const primeiraImagem =
      produto.product_images?.[0]?.url || "";

    const card = document.createElement("div");
    card.className = "produto-card";

    card.innerHTML = `
      <img src="${primeiraImagem}" />
      <h4>${produto.title}</h4>
    `;

    card.onclick = () => abrirModalProduto(produto);
    lista.appendChild(card);
  });
}

// ==========================
// MODAL + SWIPE
// ==========================
function abrirModalProduto(produto) {
  produtoAtual = produto;
  indiceImagem = 0;

  atualizarModal();

  const modal = document.getElementById("modal-produto");
  modal.classList.remove("hidden");

  const img = document.getElementById("modal-img");

  img.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  img.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;

    if (diff > 50) imagemAnterior();
    if (diff < -50) proximaImagem();
  });
}

function atualizarModal() {
  const imagens = produtoAtual.product_images;

  document.getElementById("modal-img").src =
    imagens[indiceImagem].url;

  document.getElementById("modal-titulo").textContent =
    produtoAtual.title;

  document.getElementById("modal-desc").textContent =
    produtoAtual.description;

  const whatsapp = "5516974054147";
  const msg = encodeURIComponent(
    `Olá! Gostaria de um orçamento sobre:\n${produtoAtual.title}`
  );

  document.getElementById("modal-whatsapp").href =
    `https://wa.me/${whatsapp}?text=${msg}`;
}

function proximaImagem() {
  indiceImagem =
    (indiceImagem + 1) % produtoAtual.product_images.length;
  atualizarModal();
}

function imagemAnterior() {
  indiceImagem =
    (indiceImagem - 1 + produtoAtual.product_images.length) %
    produtoAtual.product_images.length;
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
