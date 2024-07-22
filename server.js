const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const crypto = require("crypto");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Session Middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Connect to SQLite database
const db = new sqlite3.Database("database.sqlite");

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pseudo TEXT,
        password TEXT,
        numero_secu TEXT
    )`);
  db.run(`CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        login TEXT,
        word TEXT,
        score INTEGER
    )`);
});

// Route to register a new user
app.post("/register", (req, res) => {
  const { pseudo, password, numero_secu } = req.body;
  // No password hashing
  const hashedPassword = password;

  db.run(
    `INSERT INTO users (pseudo, password, numero_secu) VALUES (?, ?, ?)`,
    [pseudo, hashedPassword, numero_secu],
    function (err) {
      if (err) {
        res.json({ success: false });
        return console.error(err.message);
      }
      res.json({ success: true });
    }
  );
});

// Route to login
app.post("/login", (req, res) => {
  const { pseudo, password } = req.body;
  // No password hashing
  const hashedPassword = password;

  db.get(
    `SELECT * FROM users WHERE pseudo = ? AND password = ?`,
    [pseudo, hashedPassword],
    (err, user) => {
      if (err) {
        res.json({ success: false });
        return console.error(err.message);
      }
      if (user) {
        req.session.user = user; // Store user in session
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    }
  );
});

// Route to submit score
app.post("/submit-score", (req, res) => {
  if (!req.session.user) {
    console.log("User not authenticated:", req.session.user);
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  const { word, score } = req.body;
  const login = req.session.user.pseudo; // Use the user's pseudo from the session

  db.run(
    `INSERT INTO scores (name, word, score) VALUES (?, ?, ?)`,
    [login, word, score],
    function (err) {
      if (err) {
        console.error("Database error:", err.message);
        res.json({ success: false, message: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

// Route to get scores
app.get("/scores", (req, res) => {
  db.all(
    `SELECT name, word, score FROM scores ORDER BY score DESC`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Serve pages
app.get("/", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "index.html"));
  } else {
    res.redirect("/login.html"); // Redirect to login if not authenticated
  }
});

app.get("/score", (req, res) => {
  res.sendFile(path.join(__dirname, "score.html"));
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect");
    res.redirect("/login.html");
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
