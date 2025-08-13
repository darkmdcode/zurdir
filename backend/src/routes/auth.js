const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../database/connection');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: 'Too many authentication attempts, please try again later.'
});

const validateInvitationCode = async (code) => {
  const result = await db.query(
    'SELECT * FROM invitation_codes WHERE code = $1 AND is_active = true AND used_by IS NULL',
    [code]
  );
  return result.rows.length > 0;
};

const isUsernameBlocked = (username) => {
  const blockedUsernames = ['admin', 'root', 'administrator', 'moderator', 'system', 'zurdir'];
  return blockedUsernames.includes(username.toLowerCase());
};

// Register endpoint
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, passcode, invitationCode } = req.body;

    // Validation
    if (!username || username.length < 1) {
      return res.status(400).json({ error: 'Username must be at least 1 character long' });
    }

    if (isUsernameBlocked(username)) {
      return res.status(400).json({ error: 'This username is not allowed' });
    }

    if (!passcode || passcode.length < 8) {
      return res.status(400).json({ error: 'Passcode must be at least 8 characters long' });
    }

    if (!invitationCode || invitationCode.length !== 15) {
      return res.status(400).json({ error: 'Invalid invitation code' });
    }

    // Check if invitation code is valid
    const isValidInvitation = await validateInvitationCode(invitationCode);
    if (!isValidInvitation) {
      return res.status(400).json({ error: 'Invalid or used invitation code' });
    }

    // Check if username already exists
    const existingUser = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash passcode
    const passcodeHash = await bcrypt.hash(passcode, 12);

    // Create user
    const result = await db.query(
      `INSERT INTO users (username, passcode_hash, invitation_code) 
       VALUES ($1, $2, $3) RETURNING id, username, created_at`,
      [username, passcodeHash, invitationCode]
    );

    // Mark invitation code as used
    await db.query(
      'UPDATE invitation_codes SET used_by = $1, used_at = NOW() WHERE code = $2',
      [result.rows[0].id, invitationCode]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, passcode, stayLoggedIn = false } = req.body;

    if (!username || !passcode) {
      return res.status(400).json({ error: 'Username and passcode are required' });
    }

    // Get user
    const userResult = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check if user is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({ error: 'Account temporarily locked due to too many failed attempts' });
    }

    // Verify passcode
    const isValidPasscode = await bcrypt.compare(passcode, user.passcode_hash);
    
    if (!isValidPasscode) {
      // Increment failed attempts
      const newFailedAttempts = user.failed_attempts + 1;
      let lockUntil = null;

      if (newFailedAttempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await db.query(
        'UPDATE users SET failed_attempts = $1, locked_until = $2 WHERE id = $3',
        [newFailedAttempts, lockUntil, user.id]
      );

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed attempts and update last login
    const sessionExpires = stayLoggedIn 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.query(
      `UPDATE users SET 
        failed_attempts = 0, 
        locked_until = NULL, 
        last_login = NOW(), 
        stay_logged_in = $1,
        session_expires = $2
      WHERE id = $3`,
      [stayLoggedIn, sessionExpires, user.id]
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: stayLoggedIn ? '30d' : '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and session is valid
    const userResult = await db.query(
      'SELECT id, username, session_expires FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    if (user.session_expires && new Date(user.session_expires) < new Date()) {
      return res.status(401).json({ error: 'Session expired' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;