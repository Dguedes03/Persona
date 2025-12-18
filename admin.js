const SUPABASE_URL = "https://synsdzdwnswxgjzzwiqg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_S0H_Xqtfe0O133uu_L-SMg_yCaIROqF";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_EMAIL = "andradegdaniel03@gmail.com";

const contVisitas = document.getElementById("cont-visitas");
const contCliquesImagem = document.getElementById("cont-cliques-imagem");
const contOrcamento = document.getElementById("cont-orcamento");
const imagemInput = document.getElementById("imagem");
const btnLogout = document.getElementById("btn-logout");

let currentUser = null;

// =========================
// PÁGINAS
// =========================
function mostrarPagina(id) {
  document.querySelectorAll(".pagina").forEach(p => p.style.display = "none");
  document.getElementById(id)?.style.display = "block";
}

// =========================
// INIT ADMIN
// =========================
async function initAdmin() {
  const { data } = await supabase.auth.getUser();
  currentUser = data.user;

  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    mostrarPagina("login-admin");
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (!profile || profile.role !== "admin") {
    mostrarPagina("login-admin");
    return;
  }

  mostrarPagina("dashboard");
  carregarDashboard();
  carregarClientes();
}


// LOGIN ADMIN
document.getElementById("login-form")?.addEventListener("submit", async e => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-senha").value;
  const erro = document.getElementById("login-erro");

  erro.textContent = "";

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) {
    erro.textContent = "Email ou senha inválidos";
    return;
  }

  await initAdmin();
});

// LOGOUT
btnLogout?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  mostrarPagina("login-admin");
});

// =========================
// DASHBOARD
// =========================
async function carregarDashboard() {
  const { data } = await supabase.from("stats").select("*").eq("id", 1).single();

  contVisitas.textContent = data.visitas;
  contCliquesImagem.textContent = data.cliques_imagem;
  contOrcamento.textContent = data.cliques_orcamento;
}

// CLIENTES
async function carregarClientes() {
  const { data } = await supabase.from("profiles").select("cpf, telefone, role");

  const tbody = document.querySelector("#tabela-clientes tbody");
  tbody.innerHTML = "";

  data.forEach(p => {
    if (p.role === "admin") return;

    tbody.innerHTML += `
      <tr>
        <td>(oculto)</td>
        <td>${p.telefone || ""}</td>
        <td>${p.cpf || ""}</td>
      </tr>
    `;
  });
}

window.onload = initAdmin;
