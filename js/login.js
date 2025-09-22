import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "./firebase.js";
import { showMessage } from "./showMessage.js";

const signInForm = document.querySelector("#login-form");

signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = signInForm["email"].value;
  const password = signInForm["password"].value;
  if (!email || !password) {
    showMessage("Por favor, complete todos los campos.", "error");
    return;
  }
  try {
    const userCredentials = await signInWithEmailAndPassword(auth, email, password);
    showMessage("Inicio de sesión exitoso", "success");
    window.location.href = "index.html";
  } catch (error) {
    if (error.code === "auth/wrong-password") {
      showMessage("Contraseña incorrecta", "error");
    } else if (error.code === "auth/user-not-found") {
      showMessage("El correo electrónico es inválido", "error");
    } else {
      showMessage("Algo salió mal. Inténtelo de nuevo.", "error");
    }
  }
});
