const express = require('express');
const { authenticateAdmin } = require('../middleware/auth');
const db = require('../database/connection');

const router = express.Router();

// Admin authentication
router.post('/login', async (req, res) => {
  try {
    const { passcode } = req.body;
    
    if (passcode === process.env.ADMIN_PASSCODE) {
      res.json({ success: true, message: 'Admin authenticated' });
    } else {
      res.status(401).json({ error: 'Invalid admin passcode' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// Get all users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, username, invitation_code, created_at, last_login, 
        failed_attempts, locked_until, stay_logged_in
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get invitation codes
router.get('/invitation-codes', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ic.*, u.username as used_by_username
      FROM invitation_codes ic
      LEFT JOIN users u ON ic.used_by = u.id
      ORDER BY ic.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching invitation codes:', error);
    res.status(500).json({ error: 'Failed to fetch invitation codes' });
  }
});

// Create invitation code
router.post('/invitation-codes', authenticateAdmin, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || code.length !== 15) {
      return res.status(400).json({ error: 'Invitation code must be exactly 15 characters' });
    }
    
    const result = await db.query(
      'INSERT INTO invitation_codes (code) VALUES ($1) RETURNING *',
      [code]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Invitation code already exists' });
    }
    console.error('Error creating invitation code:', error);
    res.status(500).json({ error: 'Failed to create invitation code' });
  }
});

// Update invitation code status
router.patch('/invitation-codes/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const result = await db.query(
      'UPDATE invitation_codes SET is_active = $1 WHERE id = $2 RETURNING *',
      [is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation code not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating invitation code:', error);
    res.status(500).json({ error: 'Failed to update invitation code' });
  }
});

// Unlock user account
router.post('/users/:id/unlock', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1 RETURNING username',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: `User ${result.rows[0].username} unlocked successfully` });
  } catch (error) {
    console.error('Error unlocking user:', error);
    res.status(500).json({ error: 'Failed to unlock user' });
  }
});

// Get chat statistics
router.get('/chat-stats', authenticateAdmin, async (req, res) => {
  try {
    const totalSessions = await db.query('SELECT COUNT(*) as count FROM chat_sessions');
    const totalMessages = await db.query('SELECT COUNT(*) as count FROM chat_messages');
    const activeUsers = await db.query('SELECT COUNT(*) as count FROM users WHERE last_login > NOW() - INTERVAL \'7 days\'');
    
    res.json({
      totalSessions: parseInt(totalSessions.rows[0].count),
      totalMessages: parseInt(totalMessages.rows[0].count),
      activeUsers: parseInt(activeUsers.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching chat statistics:', error);
    res.status(500).json({ error: 'Failed to fetch chat statistics' });
  }
});

// Delete user chat history
router.delete('/users/:id/chats', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM chat_sessions WHERE user_id = $1', [id]);
    
    res.json({ message: `Deleted ${result.rowCount} chat sessions` });
  } catch (error) {
    console.error('Error deleting user chats:', error);
    res.status(500).json({ error: 'Failed to delete user chats' });
  }
});

// Delete all chat history
router.delete('/chats/all', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM chat_sessions');
    
    res.json({ message: `Deleted all ${result.rowCount} chat sessions` });
  } catch (error) {
    console.error('Error deleting all chats:', error);
    res.status(500).json({ error: 'Failed to delete all chats' });
  }
});

// Get system logs
router.get('/logs', authenticateAdmin, async (req, res) => {
  try {
    const { limit = 100, level } = req.query;
    
    let query = 'SELECT * FROM system_logs';
    const params = [];
    
    if (level) {
      query += ' WHERE level = $1';
      params.push(level);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit));
    
    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;