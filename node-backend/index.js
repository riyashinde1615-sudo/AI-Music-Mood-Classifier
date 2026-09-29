const express = require("express");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");
const crypto = require("crypto");

const {
  initDatabase,
  getDatabase,
  saveDatabase
} = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

const FASTAPI_URL =
  "https://ai-music-mood-classifier-1-yz2u.onrender.com";

const upload = multer({
  storage: multer.memoryStorage()
});


// ==========================
// PASSWORD HASH
// ==========================

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
}


// ==========================
// HOME
// ==========================

app.get("/", (req, res) => {
  res.json({
    message: "Node.js Backend is running!"
  });
});


// ==========================
// REGISTER
// ==========================

app.post("/register", (req, res) => {

  try {

    const db = getDatabase();

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required"
      });
    }

    const check = db.exec(
      `SELECT id FROM users WHERE email = '${email.replace(/'/g, "''")}'`
    );

    if (check.length > 0 && check[0].values.length > 0) {
      return res.status(400).json({
        error: "Email already registered"
      });
    }

    const hashedPassword = hashPassword(password);

    const stmt = db.prepare(`
      INSERT INTO users
      (name, email, password)
      VALUES (?, ?, ?)
    `);

    stmt.run([
      name,
      email,
      hashedPassword
    ]);

    stmt.free();

    saveDatabase();

    res.json({
      message: "Registration successful"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Registration failed"
    });

  }

});


// ==========================
// LOGIN
// ==========================

app.post("/login", (req, res) => {

  try {

    const db = getDatabase();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const safeEmail = email.replace(/'/g, "''");

    const result = db.exec(`
      SELECT id, name, email, password
      FROM users
      WHERE email = '${safeEmail}'
    `);

    if (
      result.length === 0 ||
      result[0].values.length === 0
    ) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const user = result[0].values[0];

    const hashedPassword = hashPassword(password);

    if (user[3] !== hashedPassword) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user[0],
        name: user[1],
        email: user[2]
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Login failed"
    });

  }

});


// ==========================
// LYRICS PREDICTION
// ==========================

app.post("/predict-lyrics", async (req, res) => {

  try {

    const db = getDatabase();

    const response = await fetch(
      `${FASTAPI_URL}/predict-lyrics`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();

    // Save prediction
    if (data.mood) {

      const stmt = db.prepare(`
        INSERT INTO predictions
        (user_id, filename, lyrics, mood, confidence, intensity)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        req.body.user_id || null,
        null,
        req.body.lyrics || "",
        data.mood,
        data.confidence || 0,
        data.intensity || "Medium"
      ]);

      stmt.free();

      saveDatabase();
    }

    res.status(response.status).json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Cannot connect to FastAPI backend"
    });

  }

});


// ==========================
// MUSIC PREDICTION
// ==========================

app.post(
  "/predict",
  upload.single("file"),
  async (req, res) => {

    try {

      const db = getDatabase();

      if (!req.file) {

        return res.status(400).json({
          error: "No music file uploaded"
        });

      }

      const form = new FormData();

      form.append(
        "file",
        req.file.buffer,
        {
          filename: req.file.originalname,
          contentType: req.file.mimetype
        }
      );

      const response = await fetch(
        `${FASTAPI_URL}/predict`,
        {
          method: "POST",
          body: form,
          headers: form.getHeaders()
        }
      );

      const data = await response.json();

      // Save music prediction
      if (data.mood) {

        const stmt = db.prepare(`
          INSERT INTO predictions
          (user_id, filename, lyrics, mood, confidence, intensity)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        stmt.run([
          req.body.user_id || null,
          req.file.originalname,
          "",
          data.mood,
          data.confidence || 0,
          data.intensity || "Medium"
        ]);

        stmt.free();

        saveDatabase();
      }

      res.status(response.status).json(data);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error: "Cannot connect to FastAPI backend"
      });

    }

  }
);


// ==========================
// PREDICTION HISTORY
// ==========================

app.get("/history/:userId", (req, res) => {

  try {

    const db = getDatabase();

    const userId = Number(req.params.userId);

    const result = db.exec(`
      SELECT
        id,
        filename,
        lyrics,
        mood,
        confidence,
        intensity,
        created_at
      FROM predictions
      WHERE user_id = ${userId}
      ORDER BY id DESC
    `);

    let history = [];

    if (result.length > 0) {

      history = result[0].values.map(row => ({
        id: row[0],
        filename: row[1],
        lyrics: row[2],
        mood: row[3],
        confidence: row[4],
        intensity: row[5],
        created_at: row[6]
      }));

    }

    res.json({
      history
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Cannot get prediction history"
    });

  }

});


// ==========================
// FEEDBACK
// ==========================

app.post("/feedback", (req, res) => {

  try {

    const db = getDatabase();

    const {
      user_id,
      message,
      rating
    } = req.body;

    if (!message) {

      return res.status(400).json({
        error: "Feedback message is required"
      });

    }

    const stmt = db.prepare(`
      INSERT INTO feedback
      (user_id, message, rating)
      VALUES (?, ?, ?)
    `);

    stmt.run([
      user_id || null,
      message,
      rating || null
    ]);

    stmt.free();

    saveDatabase();

    res.json({
      message: "Feedback submitted successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Feedback submission failed"
    });

  }

});


// ==========================
// START SERVER
// ==========================

async function startServer() {

  await initDatabase();

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {

    console.log(
      `Node.js server running on port ${PORT}`
    );

  });

}

startServer();
