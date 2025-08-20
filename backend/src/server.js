const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const WebSocket = require('ws');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs'); // ADDED: For file system access
require('dotenv').config();

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });

// Trust Render's load balancer
app.set('trust proxy', 1);

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
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true
}));

// Set strict CSP to prevent browser extension script injection
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https://*",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://* ws://* wss://*",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ')
  );
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

// FIXED: Serve static files with explicit paths FIRST
app.use('/_next/static', express.static(path.join(__dirname, '../../.next/static')));
app.use('/static', express.static(path.join(__dirname, '../../public')));

// FIXED: Simple catch-all for HTML pages - ONLY for non-static, non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes and static file requests
  if (req.path.startsWith('/api/') || req.path.startsWith('/_next/') || req.path.startsWith('/static/')) {
    return next();
  }
  
  // Try to serve the HTML file
const htmlPath = path.join(__dirname, '../../.next/server/app', req.path === '/' ? 'index.html' : `${req.path}.html`);
  
  res.sendFile(htmlPath, (err) => {
    if (err) {
      // Fallback to index.html for client-side routing
      res.sendFile(path.join(__dirname, '../../.next/server/pages/index.html'));
    }
  });
});

// WebSocket handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'ai_stream') {
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

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

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