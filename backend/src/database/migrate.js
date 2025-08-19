const db = require('./connection');
const crypto = require('crypto');

const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing SQLite database...');

    // Users table
    db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        username TEXT UNIQUE NOT NULL,
        passcode_hash TEXT NOT NULL,
        invitation_code TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        failed_attempts INTEGER DEFAULT 0,
        locked_until DATETIME,
        stay_logged_in INTEGER DEFAULT 0,
        session_expires DATETIME
      );
    `);

    // Invitation codes table
    db.query(`
      CREATE TABLE IF NOT EXISTS invitation_codes (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        code TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        used_by TEXT REFERENCES users(id),
        used_at DATETIME,
        is_active INTEGER DEFAULT 1
      );
    `);

    // Chat sessions table
    db.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Chat messages table (without vector embeddings)
    db.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // AI models table
    db.query(`
      CREATE TABLE IF NOT EXISTS ai_models (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        provider TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // File uploads table
    db.query(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // System logs table
    db.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Error logs table
    db.query(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT REFERENCES users(id),
        error_type TEXT NOT NULL,
        error_message TEXT NOT NULL,
        stack_trace TEXT,
        request_info TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    db.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);');
    db.query('CREATE INDEX IF NOT EXISTS idx_users_invitation_code ON users(invitation_code);');
    db.query('CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);');
    db.query('CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);');
    db.query('CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);');
    db.query('CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);');
    db.query('CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);');

    console.log('✅ SQLite database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initializeDatabase };