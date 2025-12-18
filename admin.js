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
const btnLogout = document.getElementById("btn-logout");

// ==========================
// ESTADO
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
  document.getElementById(id)?.style.display = "block";
}

// ==========================
// INIT ADMIN
// ==========================
async function initAdmin() {
  const { data: authData } = await supabase.auth.getUser();
  currentUser = authData?.user || null;

  if (!currentUser) {
    mostrarPagina("login-admin");
    return;
  }

  // Busca perfil
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (error || !profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    mostrarPagina("login-admin");
    return;
  }

  currentProfile = profile;

  mostrarPagina("dashboard");
  await carregarDashboard();
  await carregarClientes();
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
    return;
  }

  await initAdmin();
});

// ==========================
// LOGOUT
// ==========================
btnLogout?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  mostrarPagina("login-admin");
});

// ==========================
// DASHBOARD (STATS)
// ==========================
async function carregarDashboard() {
  const { data, error } = await supabase
    .from("stats")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.error("Erro ao carregar stats", error);
    return;
  }

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
    console.error("Erro ao carregar clientes", error);
    return;
  }

  const tbody = document.querySelector("#tabela-clientes tbody");
  tbody.innerHTML = "";

  data.forEach(p => {
    if (p.role === "admin") return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>(email protegido)</td>
      <td>${p.telefone || ""}</td>
      <td>${p.cpf || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================
// UPLOAD DE FOTOS
// ==========================
async function adicionarFoto() {
  if (!currentProfile) return;

  const file = imagemInput.files[0];
  if (!file) {
    alert("Selecione uma imagem");
    return;
  }

  const nomeArquivo = `${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase
    .storage
    .from("photos")
    .upload(nomeArquivo, file);

  if (uploadError) {
    alert("Erro ao enviar imagem");
    return;
  }

  const { data: urlData } = supabase
    .storage
    .from("photos")
    .getPublicUrl(nomeArquivo);

  const { error: insertError } = await supabase
    .from("photos")
    .insert({ url: urlData.publicUrl });

  if (insertError) {
    alert("Erro ao salvar imagem");
    return;
  }

  alert("Foto enviada com sucesso!");
  imagemInput.value = "";
}

// ==========================
// AUTO INIT
// ==========================
window.onload = () => {
  initAdmin();

  supabase.auth.onAuthStateChange(() => {
    initAdmin();
  });
};
