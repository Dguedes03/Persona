// ==========================
// CONFIGURAÇÃO SUPABASE
// ==========================
const SUPABASE_URL = "https://synsdzdwnswxgjzzwiqg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_S0H_Xqtfe0O133uu_L-SMg_yCaIROqF";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const ADMIN_EMAIL = "";

// ==========================
// ELEMENTOS
// ==========================
const contVisitas = document.getElementById("cont-visitas");
const contCliquesImagem = document.getElementById("cont-cliques-imagem");
const contOrcamento = document.getElementById("cont-orcamento");
const imagemInput = document.getElementById("imagem");
const btnLogout = document.getElementById("btn-logout");

// ==========================
// ESTADO
// ==========================
let currentUser = null;

// ==========================
// TELAS
// ==========================
function mostrarPagina(id) {
  document.querySelectorAll(".pagina").forEach(p => p.style.display = "none");
  document.getElementById(id)?.style.display = "block";
}

// ==========================
// INIT
// ==========================
async function initAdmin() {
  const { data } = await supabase.auth.getUser();
  currentUser = data.user;

  if (!currentUser) {
    mostrarPagina("login-admin");
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    mostrarPagina("login-admin");
    return;
  }

  mostrarPagina("dashboard");
  carregarDashboard();
  carregarClientes();
}

// ==========================
// LOGIN
// ==========================
document.getElementById("login-form")?.addEventListener("submit", async e => {
  e.preventDefault();

  if (document.getElementById("login-email").value !== ADMIN_EMAIL) {
    document.getElementById("login-erro").textContent = "Acesso restrito";
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: document.getElementById("login-email").value,
    password: document.getElementById("login-senha").value
  });

  if (error) {
    document.getElementById("login-erro").textContent = "Erro de login";
    return;
  }

  initAdmin();
});

// ==========================
// DASHBOARD
// ==========================
async function carregarDashboard() {
  const { data } = await supabase.from("stats").select("*").eq("id", 1).single();
  contVisitas.textContent = data.visitas;
  contCliquesImagem.textContent = data.cliques_imagem;
  contOrcamento.textContent = data.cliques_orcamento;
}

// ==========================
// CLIENTES
// ==========================
async function carregarClientes() {
  const { data } = await supabase.from("profiles").select("telefone, cpf, role");
  const tbody = document.querySelector("#tabela-clientes tbody");
  tbody.innerHTML = "";

  data.forEach(p => {
    if (p.role === "admin") return;
    tbody.innerHTML += `<tr><td>(email)</td><td>${p.telefone}</td><td>${p.cpf}</td></tr>`;
  });
}

// ==========================
// UPLOAD
// ==========================
async function adicionarFoto() {
  const file = imagemInput.files[0];
  if (!file) return;

  const name = `${Date.now()}-${file.name}`;

  await supabase.storage.from("photos").upload(name, file);
  const { data } = supabase.storage.from("photos").getPublicUrl(name);
  await supabase.from("photos").insert({ url: data.publicUrl });

  alert("Foto enviada");
}

btnLogout?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  mostrarPagina("login-admin");
});

window.onload = initAdmin;
