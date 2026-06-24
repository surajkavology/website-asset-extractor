const axios = require('axios');

const HEX_REGEX = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
const RGB_REGEX = /rgb(?:a)?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g;
const HSL_REGEX = /hsl(?:a)?\(\s*(\d{1,3})\s*,\s*[\d.]+%\s*,\s*[\d.]+%/g;

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function isGray(r, g, b) {
  return Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
}

function isWhiteOrBlack(r, g, b) {
  return (r > 240 && g > 240 && b > 240) || (r < 20 && g < 20 && b < 20);
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function expandHex3(hex) {
  if (hex.length === 4) {
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex;
}

function parseColors(cssText) {
  const colorMap = new Map();

  let match;
  while ((match = HEX_REGEX.exec(cssText)) !== null) {
    const hex = expandHex3(match[0]).toLowerCase();
    colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
  }

  RGB_REGEX.lastIndex = 0;
  while ((match = RGB_REGEX.exec(cssText)) !== null) {
    const hex = rgbToHex(+match[1], +match[2], +match[3]);
    colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
  }

  const filtered = [...colorMap.entries()]
    .filter(([hex]) => {
      const { r, g, b } = hexToRgb(hex);
      return !isWhiteOrBlack(r, g, b);
    })
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex);

  const colorful = filtered.filter((hex) => {
    const { r, g, b } = hexToRgb(hex);
    return !isGray(r, g, b);
  });

  const grays = filtered.filter((hex) => {
    const { r, g, b } = hexToRgb(hex);
    return isGray(r, g, b);
  });

  return [...new Set([...colorful.slice(0, 10), ...grays.slice(0, 4)])].slice(0, 14);
}

async function extractColors(cssUrls, inlineStyles) {
  let combinedCss = inlineStyles || '';

  const fetches = cssUrls.slice(0, 8).map(async (url) => {
    try {
      const res = await axios.get(url, { timeout: 8000, responseType: 'text' });
      return res.data || '';
    } catch {
      return '';
    }
  });

  const results = await Promise.allSettled(fetches);
  results.forEach((r) => {
    if (r.status === 'fulfilled') combinedCss += r.value;
  });

  return parseColors(combinedCss);
}

module.exports = { extractColors };
