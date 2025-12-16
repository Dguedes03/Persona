const SUPABASE_URL = "https://synsdzdwnswxgjzzwiqg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_S0H_Xqtfe0O133uu_L-SMg_yCaIROqF";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ADMIN_EMAIL = "andradegdaniel03@gmail.com";

const listaFotos = document.getElementById("lista-fotos");
const loginEmail = document.getElementById("login-email");
const loginSenha = document.getElementById("login-senha");
const cadastroCPF = document.getElementById("cadastro-cpf");
const cadastroTelefone = document.getElementById("cadastro-telefone");
const loginErro = document.getElementById("login-erro");
const camposCadastro = document.getElementById("campos-cadastro");
const btnToggleCadastro = document.getElementById("btn-toggle-cadastro");
const btnLogout = document.getElementById("btn-logout");

let currentUser = null;

function mostrarPagina(id) {
  document.querySelectorAll(".pagina").forEach(p => p.style.display = "none");
  document.getElementById(id)?.style.display = "block";
}

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += cpf[i] * (10 - i);
  let r = (s * 10) % 11; if (r === 10) r = 0;
  if (r != cpf[9]) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += cpf[i] * (11 - i);
  r = (s * 10) % 11; if (r === 10) r = 0;
  return r == cpf[10];
}

function mostrarCamposCadastro(show) {
  if (camposCadastro) camposCadastro.style.display = show ? "block" : "none";
}

btnToggleCadastro?.addEventListener("click", () => mostrarCamposCadastro(true));

async function initAuth() {
  const { data } = await supabase.auth.getUser();
  currentUser = data.user || null;
  carregarFotos();
}

document.getElementById("login-form")?.addEventListener("submit", async e => {
  e.preventDefault();
  const email = loginEmail.value;
  const senha = loginSenha.value;

  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) {
    loginErro.textContent = "Email ou senha inválidos";
    return;
  }
  location.reload();
});

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

  const { data, error } = await supabase.auth.signUp({ email, password: senha });
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

async function logout() {
  await supabase.auth.signOut();
  location.reload();
}

btnLogout?.addEventListener("click", logout);

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

window.onload = initAuth;
