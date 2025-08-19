const express = require('express');
const path = require('path');

async function startServer() {
  try {
    // Initialize database
    const { initializeDatabase } = require('./backend/src/database/migrate');
    await initializeDatabase();

    // Create Express app
    const app = express();

    // Import and mount the backend API
    const backendApp = require('./backend/src/server');
    app.use('/api', backendApp);

    // Import and configure Next.js handler
    const next = require('next');
    const dev = process.env.NODE_ENV !== 'production';
    const nextApp = next({ dev, dir: path.join(__dirname) });
    const handle = nextApp.getRequestHandler();

    await nextApp.prepare();

    // Handle all other routes with Next.js
    app.all('*', (req, res) => {
      return handle(req, res);
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`Frontend: http://localhost:${port}`);
      console.log(`Backend API: http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
