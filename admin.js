const API = "https://atelier-backend-ew43.onrender.com";
const token = localStorage.getItem("token");

// ==========================
// PROTEÇÃO BÁSICA
// ==========================
if (!token) {
  location.href = "/";
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
    location.href = "/";
    return;
  }

  return res;
}

// ==========================
// VERIFICA SE É ADMIN
// ==========================
async function verificarAdmin() {
  const res = await fetchAdmin("/me");
  const me = await res.json();

  if (me.role !== "admin") {
    alert("Acesso restrito");
    localStorage.clear();
    location.href = "/";
  }
}

// ==========================
// DASHBOARD
// ==========================
async function carregarDashboard() {
  const res = await fetchAdmin("/admin/stats");
  const data = await res.json();

  document.getElementById("cont-visitas").textContent = data.visitas;
  document.getElementById("cont-cliques-imagem").textContent =
    data.cliques_imagem;
  document.getElementById("cont-orcamento").textContent =
    data.cliques_orcamento;
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
// UPLOAD FOTO
// ==========================
async function adicionarFoto() {
  const imagemInput = document.getElementById("imagem");
  const file = imagemInput.files[0];

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
}

// ==========================
// LOGOUT
// ==========================
document.getElementById("btn-logout").onclick = () => {
  localStorage.clear();
  location.href = "/";
};

// ==========================
// INIT
// ==========================
(async () => {
  await verificarAdmin();
  await carregarDashboard();
  await carregarClientes();
})();
