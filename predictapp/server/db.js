const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'hackbet.db');
require('fs').mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  points REAL NOT NULL DEFAULT 1000,
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS markets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  creator_id INTEGER NOT NULL REFERENCES users(id),
  close_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open | resolved
  outcome TEXT, -- YES | NO | NULL
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS bets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  market_id INTEGER NOT NULL REFERENCES markets(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  side TEXT NOT NULL, -- YES | NO
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active | cancelled | won | lost
  payout REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  market_id INTEGER NOT NULL REFERENCES markets(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Seed admin user if not present
const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get(adminUsername);
if (!existingAdmin) {
  const hash = bcrypt.hashSync(adminPassword, 10);
  db.prepare('INSERT INTO users (username, password_hash, points, is_admin) VALUES (?, ?, ?, 1)')
    .run(adminUsername, hash, 5000);
  console.log(`Usuario admin creado -> usuario: "${adminUsername}" contraseña: "${adminPassword}"`);
}

module.exports = db;
