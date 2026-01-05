import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://synsdzdwnswxgjzzwiqg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bnNkemR3bnN3eGdqenp3aXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTY2MDQsImV4cCI6MjA4MTEzMjYwNH0.eSCrjtJ4B1nbZov-AyeEm15ib03qgHkF2LFFAV428zA"
);

async function atualizarSenha() {
  const senha = document.getElementById("novaSenha").value;
  const msg = document.getElementById("resetMsg");

  msg.textContent = "";
  msg.style.color = "#c0392b";

  if (!senha || senha.length < 6) {
    msg.textContent = "A senha deve ter no mínimo 6 caracteres";
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password: senha
  });

  if (error) {
    msg.textContent = "Erro ao atualizar senha";
    return;
  }

  msg.style.color = "green";
  msg.textContent = "Senha atualizada com sucesso!";

  setTimeout(() => {
    window.location.href = "/Persona/";
  }, 1500);
}
