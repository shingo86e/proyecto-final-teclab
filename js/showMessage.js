export function showMessage(msg, type = "info") {
  const mensaje = document.getElementById("mensaje");
  mensaje.textContent = msg;
  mensaje.style.display = "block";
  mensaje.style.background = type === "success" ? "#43a047" : "#f44336";
  setTimeout(() => mensaje.style.display = "none", 2500);
}
