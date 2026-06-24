const { resolveUrl } = require('../utils/helpers');

const SYSTEM_FONTS = new Set([
  'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New',
  'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Tahoma',
  '-apple-system', 'BlinkMacSystemFont', 'ui-sans-serif', 'ui-serif',
  'ui-monospace', 'ui-rounded', 'Segoe UI',
]);

// ── Format helpers ────────────────────────────────────────────────────────────

function normalizeFormat(hint) {
  const h = (hint || '').toLowerCase().trim();
  if (!h) return null;
  if (h.includes('woff2')) return 'woff2';
  if (h.includes('woff')) return 'woff';
  if (h.includes('truetype') || h === 'ttf') return 'ttf';
  if (h.includes('opentype') || h === 'otf') return 'otf';
  if (h.includes('embedded-opentype') || h === 'eot') return 'eot';
  return null;
}

function formatFromUrl(rawUrl) {
  // Strip query string and fragment (#iefix IE hack) before reading extension
  const clean = rawUrl.split('?')[0].split('#')[0];
  const ext = clean.split('.').pop().toLowerCase();
  return normalizeFormat(ext);
}

// ── @font-face parser ─────────────────────────────────────────────────────────

/**
 * Parse a single @font-face block body (content between the braces).
 * Searches the whole block for url() patterns — this handles both the
 * single-src case and the "bulletproof" multi-src pattern where multiple
 * src: declarations are stacked:
 *
 *   src: url('inter.eot');
 *   src: url('inter.woff2') format('woff2'), url('inter.woff') format('woff');
 *
 * Only returns entries that have a resolvable URL pointing to a font file.
 */
function parseFontFaceBlock(block, cssBaseUrl) {
  // font-family
  const familyMatch = /font-family\s*:\s*(['"]?)([^;}\r\n]+)\1/i.exec(block);
  const family = familyMatch
    ? familyMatch[2].trim().replace(/["']/g, '').trim()
    : 'Unknown';

  // font-weight — keep exactly as declared (e.g. "700", "bold", "400 700")
  const weightMatch = /font-weight\s*:\s*([^;}\r\n]+)/i.exec(block);
  const weight = weightMatch ? weightMatch[1].trim() : '400';

  // font-style
  const styleMatch = /font-style\s*:\s*([^;}\r\n]+)/i.exec(block);
  const style = styleMatch ? styleMatch[1].trim() : 'normal';

  // ── Scan the ENTIRE block for url() instances ───────────────────────────
  // This captures all font URLs regardless of how many src: declarations exist.
  // Regex handles: url("…"), url('…'), url(…)
  const URL_RE =
    /url\s*\(\s*(?:'([^']*)'|"([^"]*)"|([^'"\)\s]+))\s*\)(?:\s*format\s*\(\s*(?:'([^']*)'|"([^"]*)"|([^'"\)\s]*))\s*\))?/gi;

  const results = [];
  let m;

  while ((m = URL_RE.exec(block)) !== null) {
    // Group 1/2/3 = URL (single-quote / double-quote / unquoted)
    const rawUrl = (m[1] ?? m[2] ?? m[3] ?? '').trim();
    // Group 4/5/6 = format hint (single-quote / double-quote / unquoted)
    const formatHint = (m[4] ?? m[5] ?? m[6] ?? '').trim();

    if (!rawUrl) continue;
    if (rawUrl.startsWith('data:')) continue; // skip embedded fonts
    if (rawUrl.startsWith('#')) continue;      // skip #iefix local ref

    // Must look like a font file (by extension or format hint)
    const fmt = normalizeFormat(formatHint) || formatFromUrl(rawUrl);
    if (!fmt) continue; // not a recognisable font file

    const absoluteUrl = resolveUrl(cssBaseUrl, rawUrl);
    if (!absoluteUrl) continue;

    results.push({ family, url: absoluteUrl, format: fmt, weight, style });
  }

  return results;
}

/**
 * Walk through CSS text and extract every @font-face block.
 * Uses brace-depth counting so it handles nested at-rules correctly.
 */
function extractFontFaces(cssText, cssBaseUrl) {
  if (!cssText) return [];

  const results = [];
  const lc = cssText.toLowerCase();
  let i = 0;

  while (i < lc.length) {
    const atIdx = lc.indexOf('@font-face', i);
    if (atIdx === -1) break;

    const braceStart = cssText.indexOf('{', atIdx);
    if (braceStart === -1) break;

    let depth = 1;
    let j = braceStart + 1;
    while (j < cssText.length && depth > 0) {
      if (cssText[j] === '{') depth++;
      else if (cssText[j] === '}') depth--;
      j++;
    }

    const block = cssText.slice(braceStart + 1, j - 1);
    results.push(...parseFontFaceBlock(block, cssBaseUrl));
    i = j;
  }

  return results;
}

// ── Font-family name extraction (for families with no direct file URL) ────────

function parseFontFamilies(cssText) {
  if (!cssText) return [];
  const families = new Set();
  const re = /font-family\s*:\s*([^;}{]+)/gi;
  let m;
  while ((m = re.exec(cssText)) !== null) {
    m[1]
      .split(',')
      .map((f) => f.trim().replace(/["']/g, '').replace(/\s+/g, ' '))
      .filter((f) => f && f.length < 80 && !f.startsWith('var('))
      .forEach((f) => families.add(f));
  }
  return [...families];
}

function parseGoogleFontNames(text) {
  const names = new Set();
  const re = /family=([^&"'\s>]+)/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    m[1]
      .split('|')
      .map((f) => f.split(':')[0].replace(/\+/g, ' ').trim())
      .filter(Boolean)
      .forEach((f) => names.add(f));
  }
  return [...names];
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Extract font information from pre-fetched CSS content.
 *
 * @param {Array<{url: string, text: string}>} cssContents
 *   CSS files already fetched by the Playwright interceptor — no re-fetching needed.
 * @param {string} html   Full rendered page HTML (for inline <style> blocks).
 * @param {string} pageUrl  Final page URL (used as base for inline-style relative URLs).
 * @returns {{ fontFaces: Array, families: string[] }}
 */
function fetchAndParseFonts(cssContents, html, pageUrl) {
  const allFontFaces = [];
  const allFamilies = new Set();
  let totalRules = 0;

  console.log(`[Fonts] CSS files to parse: ${cssContents.length}`);

  // ── Parse each intercepted CSS file ────────────────────────────────────────
  for (const { url: cssUrl, text } of cssContents) {
    const faces = extractFontFaces(text, cssUrl);
    const families = parseFontFamilies(text);

    if (faces.length > 0) {
      console.log(`[Fonts]   ${faces.length} @font-face rule(s) in ${cssUrl}`);
    }

    totalRules += faces.length;
    faces.forEach((f) => allFontFaces.push(f));
    families.forEach((f) => allFamilies.add(f));
  }

  // ── Parse inline <style> blocks from HTML ──────────────────────────────────
  // Use pageUrl as base so relative URLs like url('../fonts/x.woff2') resolve correctly.
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let sm;
  let inlineRules = 0;
  while ((sm = styleRe.exec(html)) !== null) {
    const faces = extractFontFaces(sm[1], pageUrl);
    inlineRules += faces.length;
    faces.forEach((f) => allFontFaces.push(f));
    parseFontFamilies(sm[1]).forEach((f) => allFamilies.add(f));
  }
  if (inlineRules > 0) {
    console.log(`[Fonts]   ${inlineRules} @font-face rule(s) in inline <style> tags`);
  }
  totalRules += inlineRules;

  // ── Collect Google Font family names mentioned in HTML/CSS ─────────────────
  parseGoogleFontNames(html).forEach((f) => allFamilies.add(f));

  // ── Deduplicate font faces by URL ──────────────────────────────────────────
  const seenUrls = new Set();
  const dedupedFaces = allFontFaces.filter((f) => {
    if (!f.url || seenUrls.has(f.url)) return false;
    seenUrls.add(f.url);
    return true;
  });

  // ── Build families list (excluding system fonts) ───────────────────────────
  // Also add families found in font faces
  dedupedFaces.forEach((f) => {
    if (f.family && f.family !== 'Unknown') allFamilies.add(f.family);
  });

  const families = [...allFamilies]
    .filter((f) => !SYSTEM_FONTS.has(f) && f.length > 1)
    .slice(0, 40);

  // ── Log summary ────────────────────────────────────────────────────────────
  console.log(`[Fonts] Total @font-face rules found: ${totalRules}`);
  console.log(`[Fonts] Unique downloadable font files: ${dedupedFaces.length}`);
  console.log(`[Fonts] Font families detected: ${families.length}`);
  if (dedupedFaces.length > 0) {
    const sample = dedupedFaces.slice(0, 3).map((f) => `${f.family} (${f.format})`).join(', ');
    console.log(`[Fonts] Sample: ${sample}${dedupedFaces.length > 3 ? '…' : ''}`);
  }

  return {
    fontFaces: dedupedFaces.slice(0, 60),
    families,
  };
}

module.exports = { fetchAndParseFonts };
