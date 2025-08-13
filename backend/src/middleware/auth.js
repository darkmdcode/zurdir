const jwt = require('jsonwebtoken');
const db = require('../database/connection');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set user context for RLS
    await db.query('SELECT set_config($1, $2, true)', ['app.user_id', decoded.userId]);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['x-admin-passcode'];
    
    if (!authHeader || authHeader !== process.env.ADMIN_PASSCODE) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(403).json({ error: 'Admin authentication failed' });
  }
};

module.exports = {
  authenticateToken,
  authenticateAdmin
};