const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '../../db/zurdir.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('✅ Connected to SQLite database');

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