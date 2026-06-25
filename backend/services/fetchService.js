const axios = require('axios');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Fetch a web page and return its HTML + final URL after redirects.
 * Uses Axios — no browser required.
 */
async function fetchPage(targetUrl) {
  const response = await axios.get(targetUrl, {
    timeout: 30000,
    maxRedirects: 10,
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
    },
    responseType: 'text',
    decompress: true,
  });

  const html = response.data;

  // axios (via follow-redirects) stores the final URL here after chasing redirects
  const finalUrl =
    response.request?.res?.responseUrl ||
    response.request?.responseURL ||
    targetUrl;

  return { html, finalUrl };
}

/**
 * Fetch up to `limit` CSS files by URL.
 * Returns array of { url, text } for each successfully fetched file.
 */
async function fetchCssFiles(cssUrls, limit = 12) {
  const fetches = cssUrls.slice(0, limit).map(async (url) => {
    try {
      const res = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/css,*/*;q=0.1',
        },
        responseType: 'text',
        decompress: true,
      });
      return { url, text: res.data || '' };
    } catch {
      return null;
    }
  });

  const settled = await Promise.allSettled(fetches);
  return settled
    .filter((r) => r.status === 'fulfilled' && r.value !== null)
    .map((r) => r.value);
}

module.exports = { fetchPage, fetchCssFiles };
