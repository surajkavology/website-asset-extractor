const express = require('express');
const router = express.Router();
const { buildZip } = require('../services/zipService');

router.post('/', async (req, res) => {
  const analysisData = req.body;

  if (!analysisData) {
    return res.status(400).json({ error: 'Analysis data is required' });
  }

  try {
    const zipBuffer = await buildZip(analysisData);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="website-assets.zip"',
      'Content-Length': zipBuffer.length,
    });
    res.send(zipBuffer);
  } catch (err) {
    console.error('Download error:', err.message);
    res.status(500).json({ error: 'Failed to generate ZIP' });
  }
});

module.exports = router;
