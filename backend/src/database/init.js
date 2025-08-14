// This runs automatically on first API call
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Render
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        passcode_hash VARCHAR(255) NOT NULL
      );
      CREATE EXTENSION IF NOT EXISTS vector;
    `);
    console.log('Database tables ready');
  } finally {
    client.release();
  }
}

initDB();