document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-button").addEventListener("click", () => {
    const pseudo = document.getElementById("login-pseudo").value;
    const password = document.getElementById("login-password").value;

    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pseudo, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          document.cookie = "connect=true; path=/";
          window.location.href = "index.html";
        } else {
          alert("Pseudo ou mot de passe incorrect");
        }
      })
      .catch((error) => {
        console.error("Error logging in:", error);
      });
  });
});
