document.addEventListener("DOMContentLoaded", () => {
  let secretWord = "";
  let attempts = 0;
  const maxAttempts = 6;
  const apiUrlBase = "https://trouve-mot.fr/api";
  const difficultyLevels = {
    easy: "sizemax/5",
    medium: "size/6",
    hard: "sizemin/7",
  };

  // Vérifier si l'utilisateur est connecté
  if (!document.cookie.includes("connect=true")) {
    window.location.href = "login.html"; // Rediriger si pas connecté
  }

  document.getElementById("start-game").addEventListener("click", startGame);
  document
    .getElementById("submit-guess")
    .addEventListener("click", submitGuess);
  document.getElementById("logout").addEventListener("click", logout);

  function startGame() {
    const difficulty = document.getElementById("difficulty").value;
    const apiUrl = `${apiUrlBase}/${difficultyLevels[difficulty]}/1`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((words) => {
        secretWord = words[0].name.toUpperCase();
        document.getElementById("word-display").textContent =
          secretWord[0] + " _ ".repeat(secretWord.length - 1);
        document.getElementById("input-container").classList.remove("hidden");
        document.getElementById("guess-input").maxLength = secretWord.length;
        document.getElementById("message").textContent = "";
        document.getElementById("attempts").textContent = "";
        attempts = 0;
      });
  }

  function submitGuess() {
    const guess = document.getElementById("guess-input").value.toUpperCase();
    if (guess.length !== secretWord.length) {
      document.getElementById("message").textContent =
        "Le mot doit avoir la même longueur.";
      return;
    }
    attempts++;
    updateGrid(guess);
    checkGuess(guess);
  }

  function updateGrid(guess) {
    console.log(secretWord);
    const attemptsDiv = document.getElementById("attempts");
    const row = document.createElement("div");
    row.classList.add("attempt-row");
    for (let i = 0; i < guess.length; i++) {
      const cell = document.createElement("span");
      cell.textContent = guess[i];
      if (guess[i] === secretWord[i]) {
        cell.classList.add("correct");
      } else if (secretWord.includes(guess[i])) {
        cell.classList.add("misplaced");
      } else {
        cell.classList.add("wrong");
      }
      row.appendChild(cell);
    }
    attemptsDiv.appendChild(row);
  }

  function checkGuess(guess) {
    if (guess === secretWord) {
      document.getElementById("message").textContent = "Vous avez gagné !";
      document.getElementById("input-container").classList.add("hidden");
      submitScore(maxAttempts - attempts);
    } else if (attempts >= maxAttempts) {
      document.getElementById(
        "message"
      ).textContent = `Vous avez perdu ! Le mot était ${secretWord}`;
      document.getElementById("input-container").classList.add("hidden");
      submitScore(maxAttempts - attempts);
    }
  }

  function submitScore(score) {
    fetch("http://localhost:3000/submit-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", 
      body: JSON.stringify({
        word: secretWord,
        score: score,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          window.location.href = "score.html";
        } else {
          console.error("Failed to submit score:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error submitting score:", error);
      });
  }

  function logout() {
    fetch("/logout")
      .then(() => {
        document.cookie =
          "connect=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "login.html";
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  }
});
