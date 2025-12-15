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

// ==========================
// CONTROLE
// ==========================
let currentUser = null;
let currentProfile = null;

// ==========================
// PÁGINAS
// ==========================
function mostrarPagina(id) {
  document.querySelectorAll(".pagina").forEach(p => p.style.display = "none");
  document.getElementById(id)?.style.display = "block";
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

function mostrarCamposCadastro(show) {
  document.getElementById("campos-cadastro").style.display = show ? "block" : "none";
}

// ==========================
// AUTH
// ==========================
async function initAuth() {
  const { data } = await supabase.auth.getUser();
  currentUser = data.user || null;

  if (currentUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single();
    currentProfile = profile;
  }

  carregarFotos();
}

// LOGIN
document.getElementById("login-form").addEventListener("submit", async e => {
  e.preventDefault();

  const email = login-email.value;
  const senha = login-senha.value;

  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    document.getElementById("login-erro").textContent = "Email ou senha inválidos";
    return;
  }

  location.reload();
});

// CADASTRO CLIENTE
async function criarConta() {
  const email = login-email.value;
  const senha = login-senha.value;
  const cpf = cadastro-cpf.value;
  const telefone = cadastro-telefone.value;
  const erro = document.getElementById("login-erro");

  erro.textContent = "";

  if (!email || !senha || !cpf || !telefone) {
    erro.textContent = "Preencha todos os campos";
    return;
  }

  if (!validarCPF(cpf)) {
    erro.textContent = "CPF inválido";
    return;
  }

  if (email === ADMIN_EMAIL) {
    erro.textContent = "Email reservado para administradora";
    return;
  }

  const { data, error } = await supabase.auth.signUp({ email, password: senha });

  if (error) {
    erro.textContent = error.message;
    return;
  }

  await supabase.from("profiles").insert({
    id: data.user.id,
    role: "cliente",
    cpf,
    telefone
  });

  erro.textContent = "Conta criada! Faça login.";
  mostrarCamposCadastro(false);
}

// ==========================
// GALERIA
// ==========================
async function carregarFotos() {
  const { data } = await supabase.from("photos").select("*");

  listaFotos.innerHTML = "";

  data.forEach(foto => {
    const img = document.createElement("img");
    img.src = foto.url;

    if (!currentUser) img.classList.add("img-blur");

    listaFotos.appendChild(img);
  });
}

// ==========================
window.onload = initAuth;