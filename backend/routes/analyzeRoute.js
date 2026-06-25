const express = require('express');
const router = express.Router();
const { fetchPage, fetchCssFiles } = require('../services/fetchService');
const { extractAssets } = require('../services/assetExtractor');
const { fetchAndParseFonts } = require('../services/fontService');
const { extractMeta } = require('../services/metaService');
const { detectTechStack } = require('../services/techStackService');
const { parseColors } = require('../services/colorService');

router.post('/', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  try {
    // ── Fetch page HTML with Axios (no browser needed) ────────────────────────
    const { html, finalUrl } = await fetchPage(targetUrl);

    console.log(`[Analyze] URL: ${finalUrl}`);

    // ── Parse HTML with Cheerio ───────────────────────────────────────────────
    const assets = extractAssets(html, finalUrl);
    const meta   = extractMeta(html, finalUrl);
    const techStack = detectTechStack(html, assets.jsFiles, assets.cssFiles);

    const cssUrls    = assets.cssFiles.map((c) => c.url).filter(Boolean);
    const inlineCssText = assets.inlineCss.map((c) => c.content).join('\n');

    // ── Fetch all external CSS once — shared by font + color extraction ───────
    const cssContents = await fetchCssFiles(cssUrls);
    const combinedCssText = inlineCssText + '\n' + cssContents.map((c) => c.text).join('\n');

    console.log(`[Analyze] CSS files fetched: ${cssContents.length}`);

    const [fonts, colors] = await Promise.allSettled([
      Promise.resolve(fetchAndParseFonts(cssContents, html, finalUrl)),
      Promise.resolve(parseColors(combinedCssText)),
    ]);

    const fontData =
      fonts.status === 'fulfilled' ? fonts.value : { fontFaces: [], families: [] };

    res.json({
      url: finalUrl,
      images:      assets.images,
      videos:      assets.videos,
      svgs:        assets.svgs,
      cssFiles:    assets.cssFiles,
      jsFiles:     assets.jsFiles,
      icons:       assets.icons,
      fonts:       fontData.fontFaces,
      fontFamilies: fontData.families,
      colors:      colors.status === 'fulfilled' ? colors.value : [],
      screenshots: {}, // fetched on-demand via POST /api/screenshot
      meta,
      techStack,
    });
  } catch (err) {
    console.error('Analyze error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to analyze URL' });
  }
});

module.exports = router;
