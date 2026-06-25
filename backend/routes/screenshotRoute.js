const express = require('express');
const router = express.Router();

// Screenshots require Playwright + Chromium (~350 MB RAM per launch).
// Set ENABLE_SCREENSHOTS=true only on hosts with ≥ 512 MB free RAM
// (Railway Starter, Render Starter+, etc.).
// On Render Free leave this unset — all other features still work.
const SCREENSHOTS_ENABLED = process.env.ENABLE_SCREENSHOTS === 'true';

router.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  if (!SCREENSHOTS_ENABLED) {
    return res.status(503).json({
      error: 'Screenshot service is disabled on this deployment.',
      hint: 'Set ENABLE_SCREENSHOTS=true on a host with ≥ 512 MB RAM and run: npx playwright install chromium --with-deps',
    });
  }

  try {
    // Lazy-require so Playwright is never loaded when screenshots are disabled,
    // keeping startup memory low regardless of whether playwright is installed.
    const { takeScreenshots } = require('../services/screenshotService');
    const screenshots = await takeScreenshots(url);
    res.json(screenshots);
  } catch (err) {
    console.error('Screenshot error:', err.message);

    if (err.code === 'MODULE_NOT_FOUND' || err.message?.includes('playwright')) {
      return res.status(503).json({
        error: 'Playwright is not installed on this server.',
        hint: 'Run: npx playwright install chromium --with-deps',
      });
    }

    res.status(500).json({ error: 'Failed to take screenshots. ' + err.message });
  }
});

module.exports = router;
