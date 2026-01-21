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
      datasets: [
        {
          data: [
            data.visitas,
            data.cliques_imagem,
            data.cliques_orcamento
          ],
          backgroundColor: ["#ff7aa2", "#f1c40f", "#3498db"]
        }
      ]
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
async function carregarProdutosAdmin() {
  const res = await fetchAdmin("/products");
  if (!res) return;

  const produtos = await res.json();
  const container = document.getElementById("lista-fotos");
  if (!container) return;

  container.innerHTML = "";

  produtos.forEach(p => {
    container.innerHTML += `
      <div class="foto-item">
        <img src="${p.product_images?.[0]?.url || ""}" />
        <strong>${p.title}</strong>
        <small>${p.product_images.length} imagem(ns)</small>
        <button class="btn-danger" onclick="excluirProduto('${p.id}')">
          Excluir
        </button>
      </div>
    `;
  });
}

async function excluirProduto(id) {
  if (!confirm("Excluir este produto e todas as imagens?")) return;

  const res = await fetchAdmin(`/products/${id}`, {
    method: "DELETE"
  });

  if (!res || !res.ok) {
    alert("Erro ao excluir produto");
    return;
  }

  carregarProdutosAdmin();
}

// ==========================
// PREVIEW
// ==========================
document.getElementById("imagem")?.addEventListener("change", previewImagem);
document.getElementById("titulo")?.addEventListener("input", previewImagem);

function previewImagem() {
  const file = document.getElementById("imagem").files[0];
  const title = document.getElementById("titulo").value;

  if (!file) return;

  document.getElementById("preview").style.display = "block";
  document.getElementById("preview-img").src = URL.createObjectURL(file);
  document.getElementById("preview-title").textContent =
    title || "Título do produto";
}

// ==========================
// UPLOAD (PRODUTO + MÚLTIPLAS IMAGENS)
// ==========================
async function adicionarFoto() {
  const files = document.getElementById("imagem").files;
  const title = document.getElementById("titulo").value.trim();
  const description = document.getElementById("descricao").value.trim();

  if (!files.length || !title || !description) {
    alert("Preencha título, descrição e selecione as imagens");
    return;
  }

  const form = new FormData();
  form.append("title", title);
  form.append("description", description);

  // 🔥 campo correto para o backend
  for (const file of files) {
    form.append("files", file);
  }

  const res = await fetchAdmin("/products", {
    method: "POST",
    body: form
  });

  if (!res || !res.ok) {
    alert("Erro ao cadastrar produto");
    return;
  }

  alert("Produto cadastrado com sucesso!");

  document.getElementById("imagem").value = "";
  document.getElementById("titulo").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("preview").style.display = "none";

  carregarProdutosAdmin();
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
  await carregarProdutosAdmin();
})();
