document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("register-button").addEventListener("click", () => {
    const pseudo = document.getElementById("register-pseudo").value;
    const password = document.getElementById("register-password").value;
    const numero_secu = document.getElementById("register-numero-secu").value;

    fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pseudo, password, numero_secu }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "login.html";
        } else {
          alert("Erreur lors de l'inscription");
        }
      })
      .catch((error) => {
        console.error("Error registering:", error);
      });
  });
});
