const cheerio = require('cheerio');
const { resolveUrl } = require('../utils/helpers');

function extractMeta(html, baseUrl) {
  const $ = cheerio.load(html);

  const get = (selector, attr = 'content') => $(selector).attr(attr) || null;

  const title = $('title').first().text().trim() || get('meta[property="og:title"]') || null;
  const description =
    get('meta[name="description"]') ||
    get('meta[property="og:description"]') ||
    get('meta[name="twitter:description"]') ||
    null;
  const keywords = get('meta[name="keywords"]') || null;
  const author = get('meta[name="author"]') || null;
  const canonical = get('link[rel="canonical"]', 'href') || null;
  const ogTitle = get('meta[property="og:title"]');
  const ogImage = get('meta[property="og:image"]');
  const ogDescription = get('meta[property="og:description"]');
  const ogType = get('meta[property="og:type"]');
  const ogUrl = get('meta[property="og:url"]');
  const ogSiteName = get('meta[property="og:site_name"]');
  const twitterCard = get('meta[name="twitter:card"]');
  const twitterTitle = get('meta[name="twitter:title"]');
  const twitterDescription = get('meta[name="twitter:description"]');
  const twitterImage = get('meta[name="twitter:image"]');
  const twitterSite = get('meta[name="twitter:site"]');
  const viewport = get('meta[name="viewport"]');
  const themeColor = get('meta[name="theme-color"]');
  const robots = get('meta[name="robots"]');
  const language = $('html').attr('lang') || null;

  const faviconRaw =
    get('link[rel="icon"]', 'href') ||
    get('link[rel="shortcut icon"]', 'href') ||
    get('link[rel="apple-touch-icon"]', 'href') ||
    '/favicon.ico';
  const favicon = resolveUrl(baseUrl, faviconRaw);

  return {
    title,
    description,
    keywords,
    author,
    canonical,
    favicon,
    language,
    viewport,
    themeColor,
    robots,
    openGraph: { title: ogTitle, description: ogDescription, image: ogImage, type: ogType, url: ogUrl, siteName: ogSiteName },
    twitter: { card: twitterCard, title: twitterTitle, description: twitterDescription, image: twitterImage, site: twitterSite },
  };
}

module.exports = { extractMeta };
