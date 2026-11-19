
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(
  __dirname,
  "../../data/updates.db"
);

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS updates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    published_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ai_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

function hasUpdate(id) {
  return !!db.prepare(
    "SELECT id FROM updates WHERE id = ?"
  ).get(id);
}

function saveUpdate(item) {
  return db.prepare(`
    INSERT OR IGNORE INTO updates
    (id, title, link, published_at)
    VALUES (?, ?, ?, ?)
  `).run(
    item.id,
    item.title,
    item.link,
    item.publishedAt || null
  );
}

function getTodayAIUsage() {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });

  const result = db.prepare(`
    SELECT COUNT(*) AS total
    FROM ai_usage
    WHERE request_date = ?
  `).get(today);

  return result.total;
}

function recordAIRequest() {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });

  db.prepare(`
    INSERT INTO ai_usage (request_date)
    VALUES (?)
  `).run(today);
}

module.exports = {
  db,
  hasUpdate,
  saveUpdate,
  getTodayAIUsage,
  recordAIRequest
};

if (require.main === module) {
  console.log("Database initialized successfully!");
  console.log("Database:", dbPath);
  db.close();
}
