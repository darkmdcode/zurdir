const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/connection');

const router = express.Router();

// Get available models
router.get('/models', authenticateToken, async (req, res) => {
  try {
    const ollamaUrl = process.env.OLLAMA_CUSTOM_URL || process.env.OLLAMA_BASE_URL;
    
    const response = await fetch(`${ollamaUrl}/api/tags`);
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch AI models' });
  }
});

// Create new chat session
router.post('/sessions', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.userId;

    const result = await db.query(
      'INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING *',
      [userId, title || 'New Chat']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Get user's chat sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(`
      SELECT s.*, 
        COUNT(m.id) as message_count,
        MAX(m.created_at) as last_message_at
      FROM chat_sessions s
      LEFT JOIN chat_messages m ON s.id = m.session_id
      WHERE s.user_id = $1
      GROUP BY s.id
      ORDER BY COALESCE(MAX(m.created_at), s.created_at) DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

// Get messages for a chat session
router.get('/sessions/:sessionId/messages', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    // Verify session belongs to user
    const sessionResult = await db.query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    const result = await db.query(
      'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// Send message to AI
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, sessionId, model, thinkingTime = 0 } = req.body;
    const userId = req.user.userId;

    if (!message || !sessionId || !model) {
      return res.status(400).json({ error: 'Message, session ID, and model are required' });
    }

    // Verify session belongs to user
    const sessionResult = await db.query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Check for repetitive inputs
    const recentMessages = await db.query(`
      SELECT content FROM chat_messages 
      WHERE session_id = $1 AND role = 'user' AND created_at > NOW() - INTERVAL '5 minutes'
      ORDER BY created_at DESC LIMIT 3
    `, [sessionId]);

    if (recentMessages.rows.some(row => row.content === message)) {
      return res.status(400).json({ error: 'Please avoid sending the same message repeatedly' });
    }

    // Save user message
    await db.query(
      'INSERT INTO chat_messages (session_id, user_id, role, content) VALUES ($1, $2, $3, $4)',
      [sessionId, userId, 'user', message]
    );

    // Add thinking delay if specified
    if (thinkingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, thinkingTime * 1000));
    }

    // Get chat history for context
    const historyResult = await db.query(
      'SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC LIMIT 20',
      [sessionId]
    );

    const messages = historyResult.rows.map(row => ({
      role: row.role,
      content: row.content
    }));

    // Call Ollama API
    const ollamaUrl = process.env.OLLAMA_CUSTOM_URL || process.env.OLLAMA_BASE_URL;
    
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    const aiResponse = await response.json();
    const aiMessage = aiResponse.message.content;

    // Save AI response
    await db.query(
      'INSERT INTO chat_messages (session_id, user_id, role, content) VALUES ($1, $2, $3, $4)',
      [sessionId, userId, 'assistant', aiMessage]
    );

    // Update session timestamp
    await db.query(
      'UPDATE chat_sessions SET updated_at = datetime(\'now\') WHERE id = $1',
      [sessionId]
    );

    res.json({
      message: aiMessage,
      model: model
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Delete chat session
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const result = await db.query(
      'DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

module.exports = router;