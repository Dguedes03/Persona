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
const contVisitas = document.getElementById("cont-visitas");
const contCliquesImagem = document.getElementById("cont-cliques-imagem");
const contOrcamento = document.getElementById("cont-orcamento");
const imagemInput = document.getElementById("imagem");

// ==========================
// VARIÁVEIS DE CONTROLE
// ==========================
let currentUser = null;
let currentProfile = null;

// ==========================
// CONTROLE DE TELAS
// ==========================
function mostrarPagina(id) {
  document.querySelectorAll(".pagina").forEach(p => {
    p.style.display = "none";
  });

  const alvo = document.getElementById(id);
  if (alvo) alvo.style.display = "block";
}

// ==========================
// AUTENTICAÇÃO ADMIN
// ==========================
async function initAdmin() {
  const { data } = await supabase.auth.getUser();
  currentUser = data.user || null;

  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    bloquearAcesso();
    return;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (error || !profile || profile.role !== "admin") {
    bloquearAcesso();
    return;
  }

  currentProfile = profile;
  liberarAdmin();
}

// ==========================
// BLOQUEIO / LIBERAÇÃO
// ==========================
function bloquearAcesso() {
  supabase.auth.signOut();
  mostrarPagina("login-admin");
}

function liberarAdmin() {
  document.getElementById("btn-dashboard").style.display = "inline-block";
  document.getElementById("btn-upload").style.display = "inline-block";
  document.getElementById("btn-clientes").style.display = "inline-block";
  document.getElementById("btn-logout").style.display = "inline-block";

  mostrarPagina("dashboard");
  carregarDashboard();
  carregarClientes();
}

// ==========================
// LOGIN ADMIN
// ==========================
document.getElementById("login-form")?.addEventListener("submit", async e => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-senha").value;
  const erro = document.getElementById("login-erro");

  erro.textContent = "";

  if (email !== ADMIN_EMAIL) {
    erro.textContent = "Acesso exclusivo da administradora.";
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) {
    erro.textContent = "Email ou senha inválidos.";
  } else {
    initAdmin();
  }
});

// ==========================
// LOGOUT
// ==========================
async function logout() {
  await supabase.auth.signOut();
  location.reload();
}

// ==========================
// DASHBOARD
// ==========================
async function carregarDashboard() {
  const { data, error } = await supabase
    .from("stats")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) return;

  contVisitas.textContent = data.visitas ?? 0;
  contCliquesImagem.textContent = data.cliques_imagem ?? 0;
  contOrcamento.textContent = data.cliques_orcamento ?? 0;
}

// ==========================
// LISTAR CLIENTES
// ==========================
async function carregarClientes() {
  const { data, error } = await supabase
    .from("profiles")
    .select("telefone, cpf, role");

  if (error) {
    console.error(error);
    return;
  }

  const tbody = document.querySelector("#tabela-clientes tbody");
  tbody.innerHTML = "";

  data.forEach(perfil => {
    if (perfil.role === "admin") return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>(email protegido)</td>
      <td>${perfil.telefone || ""}</td>
      <td>${perfil.cpf || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================
// UPLOAD DE FOTOS (ADMIN)
// ==========================
async function adicionarFoto() {
  if (!currentProfile) return;

  const file = imagemInput.files[0];
  if (!file) {
    alert("Selecione uma imagem");
    return;
  }

  const name = Date.now() + "-" + file.name;

  const { error } = await supabase
    .storage
    .from("photos")
    .upload(name, file);

  if (error) {
    alert("Erro ao enviar imagem");
    return;
  }

  const { data } = supabase
    .storage
    .from("photos")
    .getPublicUrl(name);

  await supabase
    .from("photos")
    .insert({ url: data.publicUrl });

  alert("Foto enviada com sucesso!");
  imagemInput.value = "";
}

// ==========================
// INICIALIZAÇÃO
// ==========================
window.onload = () => {
  initAdmin();

  supabase.auth.onAuthStateChange(() => {
    initAdmin();
  });
};
