function resolveUrl(base, relative) {
  try {
    if (!relative) return null;
    if (relative.startsWith('data:')) return relative;
    return new URL(relative, base).href;
  } catch {
    return null;
  }
}

function deduplicateUrls(arr) {
  const seen = new Set();
  return arr.filter((url) => {
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

function isAbsoluteUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function cleanUrl(url) {
  try {
    const u = new URL(url);
    u.search = '';
    u.hash = '';
    return u.href;
  } catch {
    return url;
  }
}

module.exports = { resolveUrl, deduplicateUrls, isAbsoluteUrl, cleanUrl };
