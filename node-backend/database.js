const initSqlJs = require("sql.js");
const fs = require("fs");

let db;

async function initDatabase() {

  const SQL = await initSqlJs();

  // Existing database load करा
  if (fs.existsSync("music_mood.db")) {
    const fileBuffer = fs.readFileSync("music_mood.db");
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }


  // ==========================
  // USERS TABLE
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);


  // ==========================
  // PREDICTIONS TABLE
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      filename TEXT,
      lyrics TEXT,
      mood TEXT,
      confidence INTEGER,
      intensity TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);


  // ==========================
  // FEEDBACK TABLE
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT NOT NULL,
      rating INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);


  saveDatabase();

  console.log("Database initialized successfully!");

  return db;
}


// ==========================
// SAVE DATABASE
// ==========================

function saveDatabase() {

  const data = db.export();

  fs.writeFileSync(
    "music_mood.db",
    Buffer.from(data)
  );

}


// ==========================
// GET DATABASE
// ==========================

function getDatabase() {
  return db;
}


module.exports = {
  initDatabase,
  getDatabase,
  saveDatabase
};
