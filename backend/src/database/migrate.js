const db = require('./connection');

const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database...');

    // Enable pgvector extension
    await db.query('CREATE EXTENSION IF NOT EXISTS vector;');
    await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(255) UNIQUE NOT NULL,
        passcode_hash VARCHAR(255) NOT NULL,
        invitation_code VARCHAR(15) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE,
        failed_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP WITH TIME ZONE,
        stay_logged_in BOOLEAN DEFAULT FALSE,
        session_expires TIMESTAMP WITH TIME ZONE
      );
    `);

    // Invitation codes table
    await db.query(`
      CREATE TABLE IF NOT EXISTS invitation_codes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(15) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        used_by UUID REFERENCES users(id),
        used_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);

    // Chat sessions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Chat messages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        embedding VECTOR(1536),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // AI models table
    await db.query(`
      CREATE TABLE IF NOT EXISTS ai_models (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        provider VARCHAR(100) NOT NULL,
        endpoint VARCHAR(500) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // File uploads table
    await db.query(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size BIGINT NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // System logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        level VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Error logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        error_type VARCHAR(100) NOT NULL,
        error_message TEXT NOT NULL,
        stack_trace TEXT,
        request_info JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Database backups table
    await db.query(`
      CREATE TABLE IF NOT EXISTS database_backups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        backup_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);

    // Create indexes
    await db.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_users_invitation_code ON users(invitation_code);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_chat_messages_embedding ON chat_messages USING ivfflat (embedding vector_cosine_ops);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);');

    // Enable Row Level Security
    await db.query('ALTER TABLE users ENABLE ROW LEVEL SECURITY;');
    await db.query('ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;');
    await db.query('ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;');
    await db.query('ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;');

    // Create RLS policies
    await db.query(`
      DROP POLICY IF EXISTS users_own_data ON users;
      CREATE POLICY users_own_data ON users FOR ALL USING (id = current_setting('app.user_id')::uuid);
    `);

    await db.query(`
      DROP POLICY IF EXISTS chat_sessions_own_data ON chat_sessions;
      CREATE POLICY chat_sessions_own_data ON chat_sessions FOR ALL USING (user_id = current_setting('app.user_id')::uuid);
    `);

    await db.query(`
      DROP POLICY IF EXISTS chat_messages_own_data ON chat_messages;
      CREATE POLICY chat_messages_own_data ON chat_messages FOR ALL USING (user_id = current_setting('app.user_id')::uuid);
    `);

    await db.query(`
      DROP POLICY IF EXISTS file_uploads_own_data ON file_uploads;
      CREATE POLICY file_uploads_own_data ON file_uploads FOR ALL USING (user_id = current_setting('app.user_id')::uuid);
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initializeDatabase };