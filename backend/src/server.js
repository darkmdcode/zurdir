const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const WebSocket = require('ws');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const fileRoutes = require('./routes/files');
const searchRoutes = require('./routes/search');

// Import database
const db = require('./database/connection');
const { initializeDatabase } = require('./database/migrate');

// Initialize database and create initial invitation code if needed
async function initialize() {
  try {
    await initializeDatabase();
    
    // Check if there are any invitation codes
    const result = await db.query('SELECT COUNT(*) as count FROM invitation_codes');
    const count = result.rows[0]?.count || 0;
    
    if (count === 0) {
      // Generate a random 15-character invitation code
      const code = crypto.randomBytes(8).toString('hex').slice(0, 15);
      
      // Insert the invitation code
      await db.query(
        'INSERT INTO invitation_codes (code, is_active) VALUES (?, ?)',
        [code, 1]
      );
      
      console.log('✅ Created initial invitation code:', code);
      console.log('Use this code to create your first user account');
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: true, // Since we're on the same domain
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Sentry request handler
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/search', searchRoutes);

// WebSocket handling for real-time AI responses
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      // Handle WebSocket messages for AI streaming
      if (data.type === 'ai_stream') {
        // Implement AI streaming logic here
        ws.send(JSON.stringify({ type: 'ai_response', data: 'Response chunk' }));
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Sentry error handler
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;

// Initialize the database
initialize().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

// Export the Express app
module.exports = app;

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  try {
    await db.close();
    console.log('Database connection closed');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});