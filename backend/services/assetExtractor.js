const cheerio = require('cheerio');
const { resolveUrl, deduplicateUrls } = require('../utils/helpers');

function extractAssets(html, baseUrl) {
  const $ = cheerio.load(html);

  const images = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
    const srcset = $(el).attr('srcset');
    const alt = $(el).attr('alt') || '';
    const resolved = resolveUrl(baseUrl, src);
    if (resolved && !resolved.startsWith('data:')) {
      images.push({ url: resolved, alt });
    }
    if (srcset) {
      srcset.split(',').forEach((entry) => {
        const parts = entry.trim().split(/\s+/);
        const srcUrl = resolveUrl(baseUrl, parts[0]);
        if (srcUrl && !srcUrl.startsWith('data:')) {
          images.push({ url: srcUrl, alt });
        }
      });
    }
  });

  $('picture source').each((_, el) => {
    const srcset = $(el).attr('srcset');
    if (srcset) {
      srcset.split(',').forEach((entry) => {
        const parts = entry.trim().split(/\s+/);
        const srcUrl = resolveUrl(baseUrl, parts[0]);
        if (srcUrl) images.push({ url: srcUrl, alt: '' });
      });
    }
  });

  const uniqueImages = [];
  const seenImgUrls = new Set();
  for (const img of images) {
    if (!seenImgUrls.has(img.url)) {
      seenImgUrls.add(img.url);
      uniqueImages.push(img);
    }
  }

  const videos = [];
  $('video').each((_, el) => {
    const src = $(el).attr('src');
    if (src) {
      const resolved = resolveUrl(baseUrl, src);
      if (resolved) videos.push({ url: resolved, type: 'video' });
    }
    $(el).find('source').each((__, src_el) => {
      const s = $(src_el).attr('src');
      const type = $(src_el).attr('type') || '';
      if (s) {
        const resolved = resolveUrl(baseUrl, s);
        if (resolved) videos.push({ url: resolved, type });
      }
    });
  });

  const svgs = [];
  $('img[src$=".svg"]').each((_, el) => {
    const src = $(el).attr('src');
    const resolved = resolveUrl(baseUrl, src);
    if (resolved) svgs.push({ url: resolved, inline: false });
  });
  $('svg').each((_, el) => {
    const svgHtml = $.html(el);
    svgs.push({ url: null, inline: true, content: svgHtml.slice(0, 2000) });
  });

  const cssFiles = [];
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href');
    const resolved = resolveUrl(baseUrl, href);
    if (resolved) cssFiles.push({ url: resolved });
  });
  $('style').each((_, el) => {
    const content = $(el).html() || '';
    if (content.trim()) cssFiles.push({ url: null, inline: true, content: content.slice(0, 500) });
  });

  const jsFiles = [];
  $('script[src]').each((_, el) => {
    const src = $(el).attr('src');
    const resolved = resolveUrl(baseUrl, src);
    if (resolved) jsFiles.push({ url: resolved });
  });

  const icons = [];
  $('link[rel~="icon"], link[rel~="shortcut"], link[rel~="apple-touch-icon"]').each((_, el) => {
    const href = $(el).attr('href');
    const resolved = resolveUrl(baseUrl, href);
    if (resolved) icons.push({ url: resolved, rel: $(el).attr('rel') });
  });

  return {
    images: uniqueImages,
    videos: deduplicateUrls(videos.map((v) => v.url)).map((url) => ({ url })),
    svgs: svgs.slice(0, 50),
    cssFiles: deduplicateUrls(cssFiles.filter((c) => c.url).map((c) => c.url)).map((url) => ({ url })),
    inlineCss: cssFiles.filter((c) => c.inline),
    jsFiles: deduplicateUrls(jsFiles.map((j) => j.url)).map((url) => ({ url })),
    icons,
  };
}

module.exports = { extractAssets };
