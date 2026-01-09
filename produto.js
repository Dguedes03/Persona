const API = "https://atelier-backend-ew43.onrender.com";

// pega o id da URL ?id=123
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  document.body.innerHTML = "<p>Produto não encontrado</p>";
}

// carrega produto
async function carregarProduto() {
  const res = await fetch(`${API}/photos`);
  const fotos = await res.json();

  const produto = fotos.find(p => p.id === id);

  if (!produto) {
    document.body.innerHTML = "<p>Produto não encontrado</p>";
    return;
  }

  // primeira linha = título
  const linhas = produto.description
    ? produto.description.split("\n")
    : [];

  const titulo = linhas[0] || "Produto artesanal";
  const descricao = linhas.slice(1).join("\n");

  document.getElementById("produto-img").src = produto.url;
  document.getElementById("produto-titulo").textContent = titulo;
  document.getElementById("produto-desc").textContent = descricao;

  // WhatsApp
  const whatsapp = "5516993791350"; // <-- coloque o número real aqui
  const mensagem = encodeURIComponent(
    `Olá! Gostaria de um orçamento sobre: ${titulo}`
  );

  document.getElementById("btn-whatsapp").href =
    `https://wa.me/${whatsapp}?text=${mensagem}`;
}

carregarProduto();
