const express = require('express');
const { initializeDatabase } = require('./backend/src/database/migrate');
const backendApp = require('./backend/src/server');

// Initialize database
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

// Create Express app
const app = express();

// Mount the backend API
app.use('/api', backendApp);

// Mount the Next.js handler
app.use(require('./.next/standalone/server.js'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`> Ready on http://localhost:${port}`);
});
