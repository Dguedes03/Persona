// ==========================
// CONFIGURAÇÃO SUPABASE
// ==========================
const SUPABASE_URL = "https://synsdzdwnswxgjzzwiqg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_S0H_Xqtfe0O133uu_L-SMg_yCaIROqF";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const ADMIN_EMAIL = "andradegdaniel03@gmail.com";

// ==========================
// ELEMENTOS DO DOM
// ==========================
const listaFotos = document.getElementById("lista-fotos");
const loginEmail = document.getElementById("login-email");
const loginSenha = document.getElementById("login-senha");
const cadastroCPF = document.getElementById("cadastro-cpf");
const cadastroTelefone = document.getElementById("cadastro-telefone");
const loginErro = document.getElementById("login-erro");
const camposCadastro = document.getElementById("campos-cadastro");
const btnToggleCadastro = document.getElementById("btn-toggle-cadastro");
const btnLogout = document.getElementById("btn-logout");

// Recuperação de senha
const recuperarEmail = document.getElementById("recuperar-email");
const recuperarMsg = document.getElementById("recuperar-msg");
const novaSenha1 = document.getElementById("nova-senha1");
const novaSenha2 = document.getElementById("nova-senha2");
const novaSenhaMsg = document.getElementById("nova-senha-msg");

// ==========================
// ESTADO
// ==========================
let currentUser = null;

// ==========================
// CONTROLE DE PÁGINAS
// ==========================
function mostrarPagina(id) {
  document.querySelectorAll(".pagina").forEach(p => {
    p.style.display = "none";
  });

  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

// ==========================
// CPF
// ==========================
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += cpf[i] * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto != cpf[9]) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += cpf[i] * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  return resto == cpf[10];
}

// ==========================
// MOSTRAR CAMPOS CADASTRO
// ==========================
function mostrarCamposCadastro(show) {
  if (camposCadastro) {
    camposCadastro.style.display = show ? "block" : "none";
  }
}

btnToggleCadastro?.addEventListener("click", () => {
  mostrarCamposCadastro(true);
});

// ==========================
// AUTH INIT
// ==========================
async function initAuth() {
  const { data } = await supabase.auth.getUser();
  currentUser = data.user || null;
  carregarFotos();
}

// ==========================
// LOGIN
// ==========================
document.getElementById("login-form")?.addEventListener("submit", async e => {
  e.preventDefault();

  const email = loginEmail.value;
  const senha = loginSenha.value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) {
    loginErro.textContent = "Email ou senha inválidos";
    return;
  }

  location.reload();
});

// ==========================
// CADASTRO CLIENTE
// ==========================
async function criarConta() {
  const email = loginEmail.value;
  const senha = loginSenha.value;
  const cpf = cadastroCPF.value;
  const telefone = cadastroTelefone.value;

  loginErro.textContent = "";

  if (!email || !senha || !cpf || !telefone) {
    loginErro.textContent = "Preencha todos os campos";
    return;
  }

  if (!validarCPF(cpf)) {
    loginErro.textContent = "CPF inválido";
    return;
  }

  if (email === ADMIN_EMAIL) {
    loginErro.textContent = "Email reservado para administradora";
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha
  });

  if (error) {
    loginErro.textContent = error.message;
    return;
  }

  await supabase.from("profiles").insert({
    id: data.user.id,
    role: "cliente",
    cpf,
    telefone
  });

  loginErro.textContent = "Conta criada! Faça login.";
  mostrarCamposCadastro(false);
}

// ==========================
// LOGOUT
// ==========================
async function logout() {
  await supabase.auth.signOut();
  location.reload();
}

btnLogout?.addEventListener("click", logout);

// ==========================
// GALERIA
// ==========================
async function carregarFotos() {
  const { data } = await supabase
    .from("photos")
    .select("*");

  listaFotos.innerHTML = "";

  data.forEach(foto => {
    const img = document.createElement("img");
    img.src = foto.url;

    if (!currentUser) {
      img.classList.add("img-blur");
    }

    listaFotos.appendChild(img);
  });
}

// ==========================
// RECUPERAR SENHA (EMAIL)
// ==========================
async function enviarRecuperacao() {
  const email = recuperarEmail.value;
  recuperarMsg.textContent = "";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });

  if (error) {
    recuperarMsg.textContent = "Erro ao enviar email.";
  } else {
    recuperarMsg.textContent = "Email enviado! Verifique sua caixa de entrada.";
  }
}

// ==========================
// DETECTAR RECUPERAÇÃO
// ==========================
supabase.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") {
    mostrarPagina("nova-senha");
  }
});

// ==========================
// DEFINIR NOVA SENHA
// ==========================
async function definirNovaSenha() {
  const s1 = novaSenha1.value;
  const s2 = novaSenha2.value;

  novaSenhaMsg.textContent = "";

  if (!s1 || !s2) {
    novaSenhaMsg.textContent = "Preencha os dois campos.";
    return;
  }

  if (s1 !== s2) {
    novaSenhaMsg.textContent = "As senhas não coincidem.";
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password: s1
  });

  if (error) {
    novaSenhaMsg.textContent = "Erro ao redefinir senha.";
  } else {
    novaSenhaMsg.textContent = "Senha redefinida com sucesso!";
    setTimeout(() => {
      mostrarPagina("login");
    }, 1500);
  }
}

// ==========================
// INIT
// ==========================
window.onload = initAuth;
