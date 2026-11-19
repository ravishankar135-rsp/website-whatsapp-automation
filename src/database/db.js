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

  CREATE TABLE IF NOT EXISTS app_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
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

function getUpdateCount() {
  return db.prepare(
    "SELECT COUNT(*) AS total FROM updates"
  ).get().total;
}

function isBaselineComplete() {
  const row = db.prepare(
    "SELECT value FROM app_state WHERE key = ?"
  ).get("rss_baseline_complete");

  return row?.value === "true";
}

function markBaselineComplete() {
  db.prepare(`
    INSERT INTO app_state (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run("rss_baseline_complete", "true");
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
  getUpdateCount,
  isBaselineComplete,
  markBaselineComplete,
  getTodayAIUsage,
  recordAIRequest
};

if (require.main === module) {
  console.log("Database initialized successfully!");
  console.log("Database:", dbPath);
  db.close();
}
