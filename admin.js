// ==========================
// CONFIGURAÇÃO SUPABASE
// ==========================
const SUPABASE_URL = "https://synsdzdwnswxgjzzwiqg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_S0H_Xqtfe0O133uu_L-SMg_yCaIROqF";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_EMAIL = "andradegdaniel03@gmail.com";

let currentUser = null;
let currentProfile = null;

// ==========================
// CONTROLE DE TELAS
// ==========================
function mostrarPagina(id) {
    document.querySelectorAll(".pagina").forEach(p => p.style.display = "none");
    document.getElementById(id)?.style.display = "block";
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

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

    if (!profile || profile.role !== "admin") {
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
    alert("Acesso restrito à administradora.");
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

    const email = login-email.value;
    const senha = login-senha.value;
    const erro = document.getElementById("login-erro");

    erro.textContent = "";

    if (email !== ADMIN_EMAIL) {
        erro.textContent = "Este login é exclusivo da administradora.";
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
    const { data } = await supabase
        .from("stats")
        .select("*")
        .eq("id", 1)
        .single();

    if (!data) return;

    cont-visitas.textContent = data.visitas;
    cont-cliques-imagem.textContent = data.cliques_imagem;
    cont-orcamento.textContent = data.cliques_orcamento;
}

// ==========================
// LISTAR CLIENTES
// ==========================
async function carregarClientes() {
    const { data } = await supabase
        .from("profiles")
        .select("telefone, cpf, id");

    const tbody = document.querySelector("#tabela-clientes tbody");
    tbody.innerHTML = "";

    for (const perfil of data) {
        if (perfil.role === "admin") continue;

        const { data: user } = await supabase.auth.admin.getUserById(perfil.id);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${user?.email || ""}</td>
            <td>${perfil.telefone || ""}</td>
            <td>${perfil.cpf || ""}</td>
        `;
        tbody.appendChild(tr);
    }
}

// ==========================
// UPLOAD DE FOTOS
// ==========================
async function adicionarFoto() {
    if (!currentProfile) return;

    const file = imagem.files[0];
    if (!file) return alert("Selecione uma imagem");

    const name = Date.now() + "-" + file.name;

    const { error } = await supabase.storage.from("photos").upload(name, file);
    if (error) {
        alert("Erro ao enviar imagem");
        return;
    }

    const { data } = supabase.storage.from("photos").getPublicUrl(name);

    await supabase.from("photos").insert({
        url: data.publicUrl
    });

    alert("Foto enviada com sucesso!");
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
