const API = "https://atelier-backend-ew43.onrender.com";


let token = localStorage.getItem("token") || null;

// NAVEGAÇÃO
function mostrarPagina(id) {
  document.querySelectorAll(".pagina").forEach(p => (p.style.display = "none"));
  document.getElementById(id)?.style.display = "block";
}

// CONTAR VISITA (1x POR LOAD)
window.onload = () => {
  fetch(`${API}/stats/visit`, { method: "POST" });
  carregarFotos();
};

// LOGIN
document.getElementById("login-form")?.addEventListener("submit", async e => {
  e.preventDefault();

  const email = loginEmail.value;
  const password = loginSenha.value;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    loginErro.textContent = "Email ou senha inválidos";
    return;
  }

  //token correto (como o backend retorna)
  token = data.access_token;
  localStorage.setItem("token", token);

  mostrarPagina("galeria");
  carregarFotos();
});

// CADASTRO
async function criarConta() {
  loginErro.textContent = "";

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: loginEmail.value,
      password: loginSenha.value,
      cpf: cadastroCPF.value,
      telefone: cadastroTelefone.value
    })
  });

  if (!res.ok) {
    loginErro.textContent = "Erro ao cadastrar";
    return;
  }

  loginErro.style.color = "green";
  loginErro.textContent = "Conta criada! Faça login.";
}


// FOTOS + CLIQUE IMAGEM
async function carregarFotos() {
  const res = await fetch(`${API}/photos`);
  const fotos = await res.json();

  listaFotos.innerHTML = "";

  fotos.forEach(foto => {
    const img = document.createElement("img");
    img.src = foto.url;

    if (!token) img.classList.add("img-blur");

    // clique na imagem
    img.onclick = () => {
      fetch(`${API}/stats/click-image`, { method: "POST" });
    };

    listaFotos.appendChild(img);
  });
}


// CLIQUE ORÇAMENTO (SE EXISTIR)
document
  .getElementById("btn-orcamento")
  ?.addEventListener("click", () => {
    fetch(`${API}/stats/click-orcamento`, { method: "POST" });
  });


// LOGOUT
btnLogout?.addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});
