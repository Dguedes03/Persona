const API = "http://localhost:3000";
const token = localStorage.getItem("token");

if (!token) location.href = "/";

async function fetchAdmin(url) {
  return fetch(`${API}${url}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// DASHBOARD
async function carregarDashboard() {
  const res = await fetchAdmin("/admin/stats");
  const data = await res.json();

  contVisitas.textContent = data.visitas;
  contCliquesImagem.textContent = data.cliques_imagem;
  contOrcamento.textContent = data.cliques_orcamento;
}

// CLIENTES
async function carregarClientes() {
  const res = await fetchAdmin("/admin/clients");
  const clientes = await res.json();

  const tbody = document.querySelector("#tabela-clientes tbody");
  tbody.innerHTML = "";

  clientes.forEach(c => {
    tbody.innerHTML += `<tr><td>-</td><td>${c.telefone}</td><td>${c.cpf}</td></tr>`;
  });
}

// UPLOAD
async function adicionarFoto() {
  const file = imagemInput.files[0];
  const form = new FormData();
  form.append("file", file);

  await fetch(`${API}/photos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });

  alert("Foto enviada");
}

btnLogout.onclick = () => {
  localStorage.clear();
  location.href = "/";
};

carregarDashboard();
carregarClientes();
