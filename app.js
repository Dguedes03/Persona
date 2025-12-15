// ==========================
// 1. CONFIGURAÇÃO SUPABASE
// ==========================

// ⚠️ TROQUE PELOS SEUS DADOS DO PAINEL SUPABASE → Settings / API
const SUPABASE_URL = "https://synsdzdwnswxgjzzwiqg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_S0H_Xqtfe0O133uu_L-SMg_yCaIROqF";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// ==========================D
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
// 3. AUTENTICAÇÃO (LOGIN)
// ==========================
async function atualizarUIAuth() {
    const btnDashboard = document.getElementById("btn-dashboard");
    const btnAdmin = document.getElementById("btn-admin");
    const btnLogin = document.getElementById("btn-login");
    const btnLogout = document.getElementById("btn-logout");

    if (currentUser) {
        btnDashboard.style.display = "inline-block";
        btnAdmin.style.display = "inline-block";
        btnLogout.style.display = "inline-block";
        btnLogin.style.display = "inline-block";

        mostrarPagina("dashboard");
        atualizarDashboard();
    } else {
        btnDashboard.style.display = "none";
        btnAdmin.style.display = "none";
        btnLogout.style.display = "none";
        btnLogin.style.display = "inline-block";

        mostrarPagina("galeria");
    }
}

async function initAuth() {
    // Verifica sessão atual
    const { data } = await supabase.auth.getUser();
    currentUser = data.user || null;
    atualizarUIAuth();

    // Monitora mudanças de login/logout
    supabase.auth.onAuthStateChange((_event, session) => {
        currentUser = session?.user ?? null;
        atualizarUIAuth();
    });
}

// LOGIN
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const senha = document.getElementById("login-senha").value;
        const erroElem = document.getElementById("login-erro");

        erroElem.textContent = "";

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: senha
        });

        if (error) {
            erroElem.textContent = "Erro ao fazer login. Verifique email e senha.";
        } else {
            mostrarPagina("dashboard");
            atualizarUIAuth();
        }
    });
}

// CRIAR CONTA (dona)
async function criarConta() {
    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;
    const erroElem = document.getElementById("login-erro");

    erroElem.textContent = "";

    if (!email || !senha) {
        erroElem.textContent = "Digite email e senha.";
        return;
    }

    const { error } = await supabase.auth.signUp({
        email,
        password: senha
    });

    if (error) {
        erroElem.textContent = "Erro ao criar conta: " + error.message;
    } else {
        erroElem.textContent = "Conta criada! Faça login.";
    }
}

// LOGOUT
async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    atualizarUIAuth();
}

// ==========================
// 4. ESTATÍSTICAS
// ==========================
async function buscarStats() {
    const { data, error } = await supabase
        .from("stats")
        .select("*")
        .eq("id", 1)
        .single();

    if (error) {
        console.error(error);
        return null;
    }
    return data;
}

async function atualizarDashboard() {
    const stats = await buscarStats();
    if (!stats) return;

    document.getElementById("cont-visitas").textContent = stats.visitas ?? 0;
    document.getElementById("cont-cliques-imagem").textContent = stats.cliques_imagem ?? 0;
    document.getElementById("cont-orcamento").textContent = stats.cliques_orcamento ?? 0;
}

async function incrementarCampo(campo) {
    const stats = await buscarStats();
    if (!stats) return;

    const novoValor = (stats[campo] || 0) + 1;

    await supabase
        .from("stats")
        .update({ [campo]: novoValor })
        .eq("id", 1);

    atualizarDashboard();
}

async function registrarVisita() {
    await incrementarCampo("visitas");
}

// ==========================
// 5. FOTOS (GALERIA + UPLOAD)
// ==========================
const fotosContainer = document.getElementById("lista-fotos");

async function carregarFotos() {
    const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    fotosContainer.innerHTML = "";
    let totalFotos = 0;

    data.forEach(foto => {
        if (!foto.url) return;
        totalFotos++;

        const card = document.createElement("div");
        card.className = "foto-card";

        const img = document.createElement("img");
        img.src = foto.url;

        img.onclick = () => incrementarCampo("cliques_imagem");

        const shareBtn = document.createElement("button");
        shareBtn.className = "share-btn";
        shareBtn.innerText = "Baixar p/ compartilhar";
        shareBtn.onclick = () => compartilhar(foto.url);

        const orcBtn = document.createElement("button");
        orcBtn.className = "share-btn";
        orcBtn.innerText = "Fazer orçamento";
        orcBtn.onclick = () => fazerOrcamento();

        card.appendChild(img);
        card.appendChild(shareBtn);
        card.appendChild(orcBtn);

        fotosContainer.appendChild(card);
    });

    const contFotos = document.getElementById("cont-fotos");
    if (contFotos) contFotos.textContent = totalFotos;
}

async function adicionarFoto() {
    if (!currentUser) {
        alert("Faça login para enviar fotos.");
        mostrarPagina("login");
        return;
    }

    const fileInput = document.getElementById("imagem");
    const file = fileInput.files[0];

    if (!file) {
        alert("Selecione uma imagem!");
        return;
    }

    const fileName = Date.now() + "-" + file.name;

    // Upload
    const { error: uploadError } = await supabase
        .storage
        .from("photos")
        .upload(fileName, file);

    if (uploadError) {
        console.error(uploadError);
        alert("Erro ao enviar foto.");
        return;
    }

    // Get public URL
    const { data: publicData } = supabase
        .storage
        .from("photos")
        .getPublicUrl(fileName);

    const publicUrl = publicData.publicUrl;

    await supabase
        .from("photos")
        .insert({ url: publicUrl });

    alert("Foto adicionada!");
    fileInput.value = "";
    carregarFotos();
}

// ==========================
// 6. COMPARTILHAR + ORÇAMENTO
// ==========================
function compartilhar(imgURL) {
    const link = document.createElement("a");
    link.href = imgURL;
    link.download = "atelier-da-ana.jpg";
    link.click();
}

function fazerOrcamento() {
    incrementarCampo("cliques_orcamento");

    const mensagem = encodeURIComponent(
        "Olá! Me interessei pelo seu trabalho e gostaria de pedir um orçamento."
    );

    window.open("https://wa.me/5516974054147?text=" + mensagem, "_blank");
}

// ==========================
// 7. INICIALIZAÇÃO
// ==========================
window.addEventListener("load", async () => {
    await initAuth();
    await registrarVisita();
    await carregarFotos();
    mostrarPagina("galeria");
});
