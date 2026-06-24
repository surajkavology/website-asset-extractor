const express = require('express');
const router = express.Router();
const { launchBrowser } = require('../utils/launchBrowser');
const { extractAssets } = require('../services/assetExtractor');
const { takeScreenshots } = require('../services/screenshotService');
const { fetchAndParseFonts } = require('../services/fontService');
const { extractMeta } = require('../services/metaService');
const { detectTechStack } = require('../services/techStackService');
const { extractColors } = require('../services/colorService');

router.post('/', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  let browser;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    // ── Intercept all CSS responses during page load ──────────────────────────
    // We collect response.text() promises here (not awaited yet) so the body is
    // available.  We MUST resolve them before browser.close().
    const cssResponsePromises = [];
    const seenCssUrls = new Set();

    page.on('response', (response) => {
      const rUrl = response.url();
      if (seenCssUrls.has(rUrl)) return;
      const ct = response.headers()['content-type'] || '';
      // Accept both explicit text/css and any URL that looks like a CSS file
      if (ct.includes('text/css') || /\.css(\?|$)/i.test(rUrl.split('?')[0])) {
        seenCssUrls.add(rUrl);
        cssResponsePromises.push(
          response
            .text()
            .then((text) => ({ url: rUrl, text }))
            .catch(() => null)
        );
      }
    });
    // ─────────────────────────────────────────────────────────────────────────

    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const html = await page.content();
    const finalUrl = page.url();

    // Resolve all CSS bodies BEFORE closing the browser
    const cssSettled = await Promise.allSettled(cssResponsePromises);
    const cssContents = cssSettled
      .filter((r) => r.status === 'fulfilled' && r.value)
      .map((r) => r.value);

    await browser.close();
    browser = null;

    console.log(`[Analyze] URL: ${finalUrl}`);
    console.log(`[Analyze] CSS files intercepted: ${cssContents.length}`);

    const assets = extractAssets(html, finalUrl);
    const meta = extractMeta(html, finalUrl);
    const techStack = detectTechStack(html, assets.jsFiles, assets.cssFiles);
    const cssUrls = assets.cssFiles.map((c) => c.url).filter(Boolean);
    const inlineStyles = assets.inlineCss.map((c) => c.content).join('\n');

    const [fonts, colors, screenshots] = await Promise.allSettled([
      // Pass intercepted CSS (not URLs) + page URL for inline style resolution
      Promise.resolve(fetchAndParseFonts(cssContents, html, finalUrl)),
      extractColors(cssUrls, inlineStyles),
      takeScreenshots(finalUrl),
    ]);

    const fontData =
      fonts.status === 'fulfilled' ? fonts.value : { fontFaces: [], families: [] };

    res.json({
      url: finalUrl,
      images: assets.images,
      videos: assets.videos,
      svgs: assets.svgs,
      cssFiles: assets.cssFiles,
      jsFiles: assets.jsFiles,
      icons: assets.icons,
      fonts: fontData.fontFaces,
      fontFamilies: fontData.families,
      colors: colors.status === 'fulfilled' ? colors.value : [],
      screenshots: screenshots.status === 'fulfilled' ? screenshots.value : {},
      meta,
      techStack,
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error('Analyze error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to analyze URL' });
  }
});

module.exports = router;
