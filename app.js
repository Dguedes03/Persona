// ==========================
// 1. CONFIGURAÇÃO SUPABASE
// ==========================
const SUPABASE_URL = "https://synsdzdwnswxgjzzwiqg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_S0H_Xqtfe0O133uu_L-SMg_yCaIROqF";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_EMAIL = "andradegdaniel03@gmail.com";

let currentUser = null;
let currentProfile = null;

// ==========================
// 2. CONTROLE DE PÁGINAS
// ==========================
function mostrarPagina(pagina) {
    document.querySelectorAll(".pagina").forEach(sec => sec.style.display = "none");
    document.getElementById(pagina)?.style.display = "block";
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
    }

    ajustarUI();
}

function ajustarUI() {
    const btnDashboard = document.getElementById("btn-dashboard");
    const btnAdmin = document.getElementById("btn-admin");

    if (currentProfile?.role === "admin") {
        btnDashboard.style.display = "inline-block";
        btnAdmin.style.display = "inline-block";
        mostrarPagina("dashboard");
        atualizarDashboard();
    } else {
        btnDashboard.style.display = "none";
        btnAdmin.style.display = "none";
        mostrarPagina("galeria");
    }
}

// LOGIN
document.getElementById("login-form")?.addEventListener("submit", async e => {
    e.preventDefault();

    const email = login-email.value;
    const senha = login-senha.value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
    });

    if (error) {
        alert("Email ou senha inválidos");
        return;
    }

    // trava admin por email
    if (email === ADMIN_EMAIL) {
        currentUser = data.user;
    } else {
        currentUser = data.user;
    }

    location.reload();
});

// LOGOUT
async function logout() {
    await supabase.auth.signOut();
    location.reload();
}

// ==========================
// 4. ESTATÍSTICAS (ADMIN)
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
    const stats = await buscarStats();
    if (!stats) return;

    cont-visitas.textContent = stats.visitas;
    cont-cliques-imagem.textContent = stats.cliques_imagem;
    cont-orcamento.textContent = stats.cliques_orcamento;
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
    const { data } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });

    lista-fotos.innerHTML = "";

    data.forEach(foto => {
        const img = document.createElement("img");
        img.src = foto.url;

        // BLUR para visitante
        if (!currentUser) {
            img.classList.add("img-blur");
        }

        img.onclick = () => incrementarCampo("cliques_imagem");
        lista-fotos.appendChild(img);
    });
}

// ==========================
// 6. UPLOAD (APENAS ADMIN)
// ==========================
async function adicionarFoto() {
    if (currentProfile?.role !== "admin") {
        alert("Apenas administradora pode adicionar fotos.");
        return;
    }

    const file = imagem.files[0];
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
