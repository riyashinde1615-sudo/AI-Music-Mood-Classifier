
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
    const { lyrics, user_id } = req.body;

    if (!lyrics || !lyrics.trim()) {
      return res.status(400).json({
        error: "Lyrics are required"
      });
    }

    const text = lyrics.toLowerCase();

    let mood = "Happy";
    let confidence = 80;
    let intensity = "Medium";
    let reason = "The lyrics have a generally positive tone.";

    if (
      text.includes("love") ||
      text.includes("heart") ||
      text.includes("kiss") ||
      text.includes("romantic")
    ) {
      mood = "Romantic";
      confidence = 95;
      intensity = "High";
      reason = "The lyrics contain words related to love and romance.";

    } else if (
      text.includes("sad") ||
      text.includes("cry") ||
      text.includes("tears") ||
      text.includes("alone") ||
      text.includes("lonely")
    ) {
      mood = "Sad";
      confidence = 91;
      intensity = "High";
      reason = "The lyrics contain words related to sadness and loneliness.";

    } else if (
      text.includes("calm") ||
      text.includes("peace") ||
      text.includes("quiet") ||
      text.includes("peaceful")
    ) {
      mood = "Calm";
      confidence = 93;
      intensity = "Medium";
      reason = "The lyrics contain peaceful and calm expressions.";

    } else if (
      text.includes("angry") ||
      text.includes("hate") ||
      text.includes("fight") ||
      text.includes("rage")
    ) {
      mood = "Angry";
      confidence = 90;
      intensity = "High";
      reason = "The lyrics contain words related to anger and conflict.";

    } else if (
      text.includes("dance") ||
      text.includes("energy") ||
      text.includes("power") ||
      text.includes("run")
    ) {
      mood = "Energetic";
      confidence = 92;
      intensity = "High";
      reason = "The lyrics contain energetic and active expressions.";

    } else if (
      text.includes("fear") ||
      text.includes("scared") ||
      text.includes("danger") ||
      text.includes("afraid")
    ) {
      mood = "Fearful";
      confidence = 89;
      intensity = "High";
      reason = "The lyrics contain words related to fear and danger.";

    } else if (
      text.includes("relaxed") ||
      text.includes("sleep") ||
      text.includes("rest")
    ) {
      mood = "Relaxed";
      confidence = 94;
      intensity = "Low";
      reason = "The lyrics contain words related to relaxation and rest.";

    } else if (
      text.includes("happy") ||
      text.includes("joy") ||
      text.includes("smile")
    ) {
      mood = "Happy";
      confidence = 94;
      intensity = "High";
      reason = "The lyrics contain positive and happy expressions.";
    }

    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT INTO predictions
      (user_id, filename, lyrics, mood, confidence, intensity)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      user_id || null,
      null,
      lyrics,
      mood,
      confidence,
      intensity
    ]);

    stmt.free();
    saveDatabase();

    res.json({
      mood,
      confidence,
      intensity,
      reason
    });

  } catch (error) {
    console.error("Lyrics Analysis Error:", error);

    res.status(500).json({
      error: "Lyrics analysis failed"
    });
  }
});
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
