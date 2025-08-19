const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Use absolute path that works in both dev and production
const dbDir = path.join(process.cwd(), 'db');
const dbPath = path.join(dbDir, 'zurdir.sqlite');

// Create db directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('📁 Created database directory:', dbDir);
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('✅ Connected to SQLite database at:', dbPath);

module.exports = {
  query: (text, params = []) => {
    // Convert PostgreSQL $1, $2 style params to SQLite ? style
    const sqliteText = text.replace(/\$\d+/g, '?');
    
    try {
      if (text.trim().toLowerCase().startsWith('select')) {
        const stmt = db.prepare(sqliteText);
        return { rows: stmt.all(params) };
      } else {
        const stmt = db.prepare(sqliteText);
        const result = stmt.run(params);
        return { rows: [result] };
      }
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },
  getClient: () => db
};