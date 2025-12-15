// ==========================
// 1. CONFIGURAÇÃO SUPABASE
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
// 2. CONTROLE DE PÁGINAS
// ==========================
function mostrarPagina(pagina) {
  document.querySelectorAll(".pagina").forEach(sec => {
    sec.style.display = "none";
  });

  const alvo = document.getElementById(pagina);
  if (alvo) alvo.style.display = "block";
}

// ==========================
// 3. AUTENTICAÇÃO
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
  } else {
    currentProfile = null;
  }

  ajustarUI();
}

function ajustarUI() {
  const btnDashboard = document.getElementById("btn-dashboard");
  const btnAdmin = document.getElementById("btn-admin");

  if (btnDashboard) btnDashboard.style.display = "none";
  if (btnAdmin) btnAdmin.style.display = "none";

  mostrarPagina("galeria");
}

// ==========================
// LOGIN
// ==========================
document.getElementById("login-form")?.addEventListener("submit", async e => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-senha").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) {
    alert("Email ou senha inválidos");
    return;
  }

  location.reload();
});

// ==========================
// LOGOUT
// ==========================
async function logout() {
  await supabase.auth.signOut();
  location.reload();
}

// ==========================
// 4. ESTATÍSTICAS (ADMIN APENAS)
// ==========================
async function buscarStats() {
  if (currentProfile?.role !== "admin") return null;

  const { data } = await supabase
    .from("stats")
    .select("*")
    .eq("id", 1)
    .single();

  return data;
}

async function atualizarDashboard() {
  if (!contVisitas || !contCliquesImagem || !contOrcamento) return;

  const stats = await buscarStats();
  if (!stats) return;

  contVisitas.textContent = stats.visitas ?? 0;
  contCliquesImagem.textContent = stats.cliques_imagem ?? 0;
  contOrcamento.textContent = stats.cliques_orcamento ?? 0;
}

async function incrementarCampo(campo) {
  const stats = await buscarStats();
  if (!stats) return;

  await supabase
    .from("stats")
    .update({ [campo]: stats[campo] + 1 })
    .eq("id", 1);
}

// ==========================
// 5. GALERIA
// ==========================
async function carregarFotos() {
  if (!listaFotos) return;

  const { data } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });

  listaFotos.innerHTML = "";

  data.forEach(foto => {
    const img = document.createElement("img");
    img.src = foto.url;

    if (!currentUser) {
      img.classList.add("img-blur");
    }

    img.onclick = () => incrementarCampo("cliques_imagem");
    listaFotos.appendChild(img);
  });
}

// ==========================
// 6. UPLOAD (ADMIN APENAS)
// ==========================
async function adicionarFoto() {
  if (currentProfile?.role !== "admin") {
    alert("Apenas a administradora pode adicionar fotos.");
    return;
  }

  if (!imagemInput) return;

  const file = imagemInput.files[0];
  if (!file) return alert("Selecione uma imagem");

  const name = Date.now() + "-" + file.name;

  await supabase.storage.from("photos").upload(name, file);
  const { data } = supabase.storage.from("photos").getPublicUrl(name);

  await supabase.from("photos").insert({ url: data.publicUrl });
  carregarFotos();
}

// ==========================
// 7. ORÇAMENTO
// ==========================
function fazerOrcamento() {
  incrementarCampo("cliques_orcamento");

  const msg = encodeURIComponent(
    "Olá! Me interessei pelo seu trabalho e gostaria de pedir um orçamento."
  );

  window.open("https://wa.me/5516974054147?text=" + msg, "_blank");
}

// ==========================
// INIT
// ==========================
window.onload = async () => {
  await initAuth();
  await carregarFotos();
};
