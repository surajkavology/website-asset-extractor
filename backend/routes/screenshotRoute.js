const express = require('express');
const router = express.Router();
const { takeScreenshots } = require('../services/screenshotService');

router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const screenshots = await takeScreenshots(url);
    res.json(screenshots);
  } catch (err) {
    console.error('Screenshot error:', err.message);
    res.status(500).json({ error: 'Failed to take screenshots' });
  }
});

module.exports = router;
