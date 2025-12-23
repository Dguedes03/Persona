const API = "https://atelier-backend-ew43.onrender.com";

// ==========================
// ESTADO
// ==========================
let token = localStorage.getItem("token");

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
  carregarFotos();
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

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginSenha").value;

    loginErro.textContent = "";
    loginErro.style.color = "#c0392b";

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
// CRIAR CONTA
// ==========================
async function criarConta() {
  const msg = document.getElementById("cadastroMsg");
  msg.textContent = "";
  msg.style.color = "#c0392b";

  const email = document.getElementById("cadastroEmail").value;
  const password = document.getElementById("cadastroSenha").value;
  const cpf = document.getElementById("cadastroCPF").value;
  const telefone = document.getElementById("cadastroTelefone").value;

  if (!email || !password || !cpf || !telefone) {
    msg.textContent = "Preencha todos os campos";
    return;
  }

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, cpf, telefone })
  });

  if (!res.ok) {
    msg.textContent = "Erro ao criar conta";
    return;
  }

  msg.style.color = "green";
  msg.textContent = "Conta criada com sucesso! Faça login.";

  setTimeout(() => {
    mostrarPagina("login");
  }, 1500);
}

// ==========================
// RECUPERAR SENHA
// ==========================
async function enviarRecuperacao() {
  const email = document.getElementById("recuperarEmail").value;

  if (!email) {
    alert("Digite seu email");
    return;
  }

  const res = await fetch(`${API}/auth/recover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  if (!res.ok) {
    alert("Erro ao enviar email");
    return;
  }

  alert("Email de recuperação enviado!");
  mostrarPagina("login");
}

// ==========================
// FOTOS
// ==========================
async function carregarFotos() {
  const lista = document.getElementById("listaFotos");
  if (!lista) return;

  const res = await fetch(`${API}/photos`);
  const fotos = await res.json();

  lista.innerHTML = "";

  fotos.forEach(foto => {
    const img = document.createElement("img");
    img.src = foto.url;

    if (!token) img.classList.add("img-blur");

    img.onclick = () => {
      fetch(`${API}/stats/click-image`, { method: "POST" });
    };

    lista.appendChild(img);
  });
}

// ==========================
// LOGOUT
// ==========================
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });
}

// ==========================
// OLHO DA SENHA
// ==========================
const toggleSenha = document.getElementById("toggleSenha");
const loginSenha = document.getElementById("loginSenha");

if (toggleSenha && loginSenha) {
  toggleSenha.addEventListener("click", () => {
    const ativo = loginSenha.type === "password";
    loginSenha.type = ativo ? "text" : "password";
    toggleSenha.classList.toggle("ativo", ativo);
  });
}

// ==========================
// VERIFICA USUÁRIO / ADMIN
// ==========================
async function verificarUsuario() {
  if (!token) return;

  const res = await fetch(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) return;

  const me = await res.json();

  if (me.role === "admin") {
    ativarModoAdmin();
  }
}

// ==========================
// ATIVA MODO ADMIN NO SITE
// ==========================
function ativarModoAdmin() {
  const nav = document.querySelector(".navbar");

  if (!document.getElementById("btn-admin")) {
    const btn = document.createElement("button");
    btn.id = "btn-admin";
    btn.textContent = "Painel Admin";
    btn.onclick = () => {
      window.location.href = "/admin.html";
    };
    nav.appendChild(btn);
  }
}
