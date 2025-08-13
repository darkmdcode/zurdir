const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/connection');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      'SELECT id, username, created_at, last_login FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const sessionsResult = await db.query(
      'SELECT COUNT(*) as count FROM chat_sessions WHERE user_id = $1',
      [userId]
    );

    const messagesResult = await db.query(
      'SELECT COUNT(*) as count FROM chat_messages WHERE user_id = $1',
      [userId]
    );

    const filesResult = await db.query(
      'SELECT COUNT(*) as count FROM file_uploads WHERE user_id = $1',
      [userId]
    );

    res.json({
      totalSessions: parseInt(sessionsResult.rows[0].count),
      totalMessages: parseInt(messagesResult.rows[0].count),
      totalFiles: parseInt(filesResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

module.exports = router;