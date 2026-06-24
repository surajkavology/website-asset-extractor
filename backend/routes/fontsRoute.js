const express = require('express');
const router = express.Router();
const axios = require('axios');
const JSZip = require('jszip');

const ALLOWED_FONT_EXTS = new Set(['woff', 'woff2', 'ttf', 'otf', 'eot']);

const MIME_TYPES = {
  woff2: 'font/woff2',
  woff: 'font/woff',
  ttf: 'font/ttf',
  otf: 'font/otf',
  eot: 'application/vnd.ms-fontobject',
};

function getExt(url) {
  return url.split('?')[0].split('.').pop().toLowerCase();
}

function getFilename(url) {
  return url.split('?')[0].split('/').pop() || 'font';
}

function safeFontName(family, weight, style, ext, usedNames) {
  const base = (family || 'font')
    .replace(/[^a-zA-Z0-9\- ]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const w = weight && weight !== '400' ? `-${weight}` : '';
  const s = style && style !== 'normal' ? `-${style}` : '';
  let name = `${base}${w}${s}.${ext}`;
  let counter = 2;
  while (usedNames.has(name)) {
    name = `${base}${w}${s}-${counter}.${ext}`;
    counter++;
  }
  usedNames.add(name);
  return name;
}

// GET /api/fonts/proxy?url=...
// Proxies a font file to bypass CORS and allow browser downloads
router.get('/proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url is required' });

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'Only http/https URLs allowed' });
  }

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: parsed.origin,
      },
      maxRedirects: 5,
    });

    const ext = getExt(url);
    const filename = getFilename(url);
    const contentType =
      response.headers['content-type'] || MIME_TYPES[ext] || 'application/octet-stream';

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    });
    res.send(Buffer.from(response.data));
  } catch (err) {
    console.error('Font proxy error:', err.message);
    res.status(502).json({ error: 'Download unavailable', detail: err.message });
  }
});

// POST /api/fonts/zip  { fonts: [{ family, url, format, weight, style }] }
// Fetches all font files and returns a fonts.zip
router.post('/zip', async (req, res) => {
  const { fonts } = req.body;
  if (!Array.isArray(fonts) || fonts.length === 0) {
    return res.status(400).json({ error: 'fonts array is required' });
  }

  const zip = new JSZip();
  const folder = zip.folder('fonts');
  const usedNames = new Set();

  const fetches = fonts.slice(0, 60).map(async (font) => {
    if (!font.url) return;

    let parsed;
    try {
      parsed = new URL(font.url);
    } catch {
      return;
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) return;

    try {
      const response = await axios.get(font.url, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: parsed.origin,
        },
        maxRedirects: 5,
      });

      const ext = getExt(font.url);
      const filename = safeFontName(font.family, font.weight, font.style, ext, usedNames);
      folder.file(filename, Buffer.from(response.data));
    } catch {
      // skip unreachable font
    }
  });

  await Promise.allSettled(fetches);

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  res.set({
    'Content-Type': 'application/zip',
    'Content-Disposition': 'attachment; filename="fonts.zip"',
    'Content-Length': zipBuffer.length,
  });
  res.send(zipBuffer);
});

module.exports = router;
