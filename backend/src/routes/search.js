const express = require('express');
const fetch = require('node-fetch');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const isUrlBlocked = (url) => {
  const blockedDomains = (process.env.BLOCKED_DOMAINS || '').split(',');
  return blockedDomains.some(domain => url.includes(domain.trim()));
};

// Web search endpoint
router.post('/web', authenticateToken, async (req, res) => {
  try {
    const { query, source = 'wiby' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!process.env.ENABLE_WEB_SEARCH || process.env.ENABLE_WEB_SEARCH !== 'true') {
      return res.status(403).json({ error: 'Web search is disabled' });
    }

    let searchUrl;
    
    if (source === 'wiby') {
      searchUrl = `https://wiby.me/?q=${encodeURIComponent(query)}`;
    } else if (source === 'duckduckgo') {
      searchUrl = `https://duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
    } else {
      return res.status(400).json({ error: 'Invalid search source' });
    }

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'ZURDIR-Search/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Search service unavailable');
    }

    const html = await response.text();
    
    // Basic parsing - in a real implementation, you'd want more sophisticated parsing
    const results = [];
    
    // This is a simplified parser - you'd want to implement proper HTML parsing
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null && results.length < 10) {
      const url = match[1];
      const title = match[2];
      
      if (!isUrlBlocked(url) && url.startsWith('http')) {
        results.push({
          title: title.trim(),
          url: url,
          source: source
        });
      }
    }

    res.json({
      query,
      source,
      results
    });
  } catch (error) {
    console.error('Web search error:', error);
    res.status(500).json({ error: 'Web search failed' });
  }
});

// Get search suggestions
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Return some basic suggestions - in a real implementation, 
    // you might want to integrate with a proper suggestion API
    const suggestions = [
      `${q} tutorial`,
      `${q} examples`,
      `${q} documentation`,
      `${q} best practices`,
      `how to ${q}`
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Failed to get search suggestions' });
  }
});

module.exports = router;