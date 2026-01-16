const API = "https://atelier-backend-ew43.onrender.com";
const token = localStorage.getItem("token");

// ==========================
// PROTEÇÃO
// ==========================
if (!token) {
  location.href = "/Persona/";
}

// ==========================
// FETCH COM TOKEN
// ==========================
async function fetchAdmin(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.clear();
    location.href = "/Persona/";
    return null;
  }

  return res;
}

// ==========================
// VERIFICA ADMIN
// ==========================
async function verificarAdmin() {
  const res = await fetchAdmin("/me");
  if (!res) return;

  const me = await res.json();
  console.log("ME:", me);

  if (me.role !== "admin") {
    alert("Acesso restrito");
    localStorage.clear();
    location.href = "/Persona/";
  }
}

// ==========================
// DASHBOARD + GRÁFICO
// ==========================
let grafico;

async function carregarDashboard() {
  const res = await fetchAdmin("/admin/stats");
  if (!res) return;

  const data = await res.json();

  document.getElementById("cont-visitas").textContent = data.visitas;
  document.getElementById("cont-cliques-imagem").textContent =
    data.cliques_imagem;
  document.getElementById("cont-orcamento").textContent =
    data.cliques_orcamento;

  criarGrafico(data);
}

function criarGrafico(data) {
  const ctx = document.getElementById("grafico");
  if (!ctx || typeof Chart === "undefined") return;

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Visitas", "Cliques", "Orçamentos"],
      datasets: [{
        data: [
          data.visitas,
          data.cliques_imagem,
          data.cliques_orcamento
        ],
        backgroundColor: ["#ff7aa2", "#f1c40f", "#3498db"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

// ==========================
// CLIENTES
// ==========================
async function carregarClientes() {
  const res = await fetchAdmin("/admin/clients");
  if (!res) return;

  const clientes = await res.json();

  const tbody = document.querySelector("#tabela-clientes tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  clientes.forEach(c => {
    tbody.innerHTML += `
      <tr>
        <td>-</td>
        <td>${c.telefone}</td>
        <td>${c.cpf}</td>
      </tr>
    `;
  });
}

// ==========================
// PRODUTOS (LISTAR / EXCLUIR)
// ==========================
async function carregarFotosAdmin() {
  const res = await fetchAdmin("/photos");
  if (!res) return;

  const fotos = await res.json();

  const container = document.getElementById("lista-fotos");
  if (!container) return;

  container.innerHTML = "";

  fotos.forEach(f => {
    container.innerHTML += `
      <div class="foto-item">
        <img src="${f.url}" />
        <strong>${f.title}</strong>
        <button class="btn-danger" onclick="excluirFoto('${f.id}')">
          Excluir
        </button>
      </div>
    `;
  });
}

async function excluirFoto(id) {
  if (!confirm("Excluir este produto?")) return;

  await fetchAdmin(`/photos/${id}`, {
    method: "DELETE"
  });

  carregarFotosAdmin();
}

// ==========================
// PREVIEW
// ==========================
function previewImagem(event) {
  const file = event.target.files[0];
  const title = document.getElementById("titulo").value;

  if (!file) return;

  document.getElementById("preview").style.display = "block";
  document.getElementById("preview-img").src = URL.createObjectURL(file);
  document.getElementById("preview-title").textContent =
    title || "Título do produto";
}

// ==========================
// UPLOAD (TÍTULO + FOTO + DESCRIÇÃO)
// ==========================
async function adicionarFoto() {
  const file = document.getElementById("imagem").files[0];
  const title = document.getElementById("titulo").value;
  const description = document.getElementById("descricao").value;

  if (!file || !title || !description) {
    alert("Preencha título, foto e descrição");
    return;
  }

  const form = new FormData();
  form.append("file", file);
  form.append("title", title);
  form.append("description", description);

  await fetchAdmin("/photos", {
    method: "POST",
    body: form
  });

  alert("Produto cadastrado com sucesso!");

  document.getElementById("imagem").value = "";
  document.getElementById("titulo").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("preview").style.display = "none";

  carregarFotosAdmin();
}

// ==========================
// DARK MODE
// ==========================
const toggleDark = document.getElementById("toggle-dark");

if (toggleDark) {
  toggleDark.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "dark",
      document.body.classList.contains("dark")
    );
  };
}

if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
}

// ==========================
// LOGOUT
// ==========================
document.getElementById("btn-logout")?.addEventListener("click", () => {
  localStorage.clear();
  location.href = "/Persona/";
});

// ==========================
// INIT
// ==========================
(async () => {
  await verificarAdmin();
  await carregarDashboard();
  await carregarClientes();
  await carregarFotosAdmin();
})();
