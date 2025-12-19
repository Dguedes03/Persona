// ==========================
// CONFIGURAÇÃO SUPABASE
// ==========================
const SUPABASE_URL = "https://synsdzdwnswxgjzzwiqg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_S0H_Xqtfe0O133uu_L-SMg_yCaIROqF";

const supabaseClient = window.supabase.createClient(
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
const loginErro = document.getElementById("login-erro");

const camposCadastro = document.getElementById("campos-cadastro");
const cadastroCPF = document.getElementById("cadastro-cpf");
const cadastroTelefone = document.getElementById("cadastro-telefone");

const btnLogout = document.getElementById("btn-logout");
const recuperarEmail = document.getElementById("recuperar-email");
const recuperarMsg = document.getElementById("recuperar-msg");

// ==========================
let currentUser = null;

// ==========================
function mostrarPagina(id) {
  document.querySelectorAll(".pagina").forEach(p => {
    p.style.display = "none";
  });

  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

// ==========================
function mostrarCadastro() {
  camposCadastro.style.display = "block";
  loginErro.textContent = "";
}

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
async function initAuth() {
  const { data } = await supabaseClient.auth.getUser();
  currentUser = data.user || null;
  carregarFotos();
}

// ==========================
document.getElementById("login-form")?.addEventListener("submit", async e => {
  e.preventDefault();

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: loginEmail.value,
    password: loginSenha.value
  });

  if (error) {
    loginErro.textContent = "Email ou senha inválidos";
    return;
  }

  await initAuth();
  mostrarPagina("galeria");
});

// ==========================
async function criarConta() {
  loginErro.textContent = "";

  if (!loginEmail.value || !loginSenha.value || !cadastroCPF.value || !cadastroTelefone.value) {
    loginErro.textContent = "Preencha todos os campos";
    return;
  }

  if (!validarCPF(cadastroCPF.value)) {
    loginErro.textContent = "CPF inválido";
    return;
  }

  if (loginEmail.value === ADMIN_EMAIL) {
    loginErro.textContent = "Email reservado";
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email: loginEmail.value,
    password: loginSenha.value
  });

  if (error) {
    loginErro.textContent = error.message;
    return;
  }

  await supabaseClient.from("profiles").insert({
    id: data.user.id,
    role: "cliente",
    cpf: cadastroCPF.value,
    telefone: cadastroTelefone.value
  });

  loginErro.style.color = "green";
  loginErro.textContent = "Conta criada! Faça login.";
  camposCadastro.style.display = "none";
}

// ==========================
async function carregarFotos() {
  const { data } = await supabaseClient.from("photos").select("*");
  listaFotos.innerHTML = "";

  data?.forEach(foto => {
    const img = document.createElement("img");
    img.src = foto.url;
    if (!currentUser) img.classList.add("img-blur");
    listaFotos.appendChild(img);
  });
}

// ==========================
async function enviarRecuperacao() {
  const { error } = await supabaseClient.auth.resetPasswordForEmail(recuperarEmail.value);
  recuperarMsg.textContent = error ? "Erro ao enviar email" : "Email enviado";
}

// ==========================
btnLogout?.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  location.reload();
});

window.onload = initAuth;
