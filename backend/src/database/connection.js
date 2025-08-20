const sqlite3 = require('sqlite3').verbose();
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

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite database:', err);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
  }
});

// Promisify database operations
const promisify = (operation, params = []) => {
  return new Promise((resolve, reject) => {
    operation.call(db, params, function(err, result) {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

module.exports = {
  query: async (text, params = []) => {
    // Convert PostgreSQL $1, $2 style params to SQLite ? style
    const sqliteText = text.replace(/\$\d+/g, '?');
    
    try {
      if (text.trim().toLowerCase().startsWith('select')) {
        return new Promise((resolve, reject) => {
          db.all(sqliteText, params, (err, rows) => {
            if (err) reject(err);
            else resolve({ rows });
          });
        });
      } else {
        return new Promise((resolve, reject) => {
          db.run(sqliteText, params, function(err) {
            if (err) reject(err);
            else resolve({ rows: [{ lastID: this.lastID, changes: this.changes }] });
          });
        });
      }
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  },
  getClient: () => db,
  close: () => {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};