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
    return;
  }

  return res;
}

// ==========================
// VERIFICA ADMIN
// ==========================
async function verificarAdmin() {
  const res = await fetchAdmin("/me");
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
  if (!ctx) return;

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
  const clientes = await res.json();

  const tbody = document.querySelector("#tabela-clientes tbody");
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
// FOTOS (LISTAR / DESCRIÇÃO / EXCLUIR)
// ==========================
async function carregarFotosAdmin() {
  const res = await fetch(`${API}/photos`);
  const fotos = await res.json();

  const container = document.getElementById("lista-fotos");
  if (!container) return;

  container.innerHTML = "";

  fotos.forEach(f => {
    container.innerHTML += `
      <div class="foto-item">
        <img src="${f.url}" />

        <textarea
          placeholder="Descrição do produto (1ª linha será o título)"
          onblur="salvarDescricao('${f.id}', this.value)"
        >${f.description || ""}</textarea>

        <button class="btn-danger" onclick="excluirFoto('${f.id}')">
          Excluir
        </button>
      </div>
    `;
  });
}

async function salvarDescricao(id, description) {
  await fetchAdmin(`/photos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ description })
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
// UPLOAD
// ==========================
async function adicionarFoto() {
  const file = document.getElementById("imagem").files[0];
  if (!file) {
    alert("Selecione uma imagem");
    return;
  }

  const form = new FormData();
  form.append("file", file);

  await fetchAdmin("/photos", {
    method: "POST",
    body: form
  });

  alert("Foto enviada com sucesso");
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
document.getElementById("btn-logout").onclick = () => {
  localStorage.clear();
  location.href = "/Persona/";
};

// ==========================
// INIT
// ==========================
(async () => {
  await verificarAdmin();
  await carregarDashboard();
  await carregarClientes();
  await carregarFotosAdmin();
})();
