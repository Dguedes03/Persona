const SUPABASE_URL = "https://synsdzdwnswxgjzzwiqg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_S0H_Xqtfe0O133uu_L-SMg_yCaIROqF";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ADMIN_EMAIL = "andradegdaniel03@gmail.com";

const contVisitas = document.getElementById("cont-visitas");
const contCliquesImagem = document.getElementById("cont-cliques-imagem");
const contOrcamento = document.getElementById("cont-orcamento");
const imagemInput = document.getElementById("imagem");
const btnLogout = document.getElementById("logout");

let currentUser = null;
let currentProfile = null;

function mostrarPagina(id) {
  document.querySelectorAll(".pagina").forEach(p => p.style.display = "none");
  document.getElementById(id)?.style.display = "block";
}

async function initAdmin() {
  const { data } = await supabase.auth.getUser();
  currentUser = data.user || null;

  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    await supabase.auth.signOut();
    mostrarPagina("login-admin");
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    mostrarPagina("login-admin");
    return;
  }

  currentProfile = profile;
  mostrarPagina("dashboard");
  carregarDashboard();
  carregarClientes();
}

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

  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) erro.textContent = "Email ou senha inválidos.";
  else initAdmin();
});

async function logout() {
  await supabase.auth.signOut();
  location.reload();
}
btnLogout?.addEventListener("click", logout);

async function carregarDashboard() {
  const { data } = await supabase.from("stats").select("*").eq("id", 1).single();
  if (!data) return;
  contVisitas.textContent = data.visitas ?? 0;
  contCliquesImagem.textContent = data.cliques_imagem ?? 0;
  contOrcamento.textContent = data.cliques_orcamento ?? 0;
}

async function carregarClientes() {
  const { data } = await supabase.from("profiles").select("telefone, cpf, role");
  const tbody = document.querySelector("#tabela-clientes tbody");
  tbody.innerHTML = "";
  data.forEach(p => {
    if (p.role === "admin") return;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>(email protegido)</td><td>${p.telefone || ""}</td><td>${p.cpf || ""}</td>`;
    tbody.appendChild(tr);
  });
}

async function adicionarFoto() {
  if (!currentProfile) return;
  const file = imagemInput.files[0];
  if (!file) return alert("Selecione uma imagem");

  const name = Date.now() + "-" + file.name;
  await supabase.storage.from("photos").upload(name, file);
  const { data } = supabase.storage.from("photos").getPublicUrl(name);
  await supabase.from("photos").insert({ url: data.publicUrl });

  alert("Foto enviada!");
  imagemInput.value = "";
}

window.onload = initAdmin;
