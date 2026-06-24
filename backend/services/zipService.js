const JSZip = require('jszip');
const axios = require('axios');

async function fetchBinary(url) {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    return Buffer.from(res.data);
  } catch {
    return null;
  }
}

function getFilename(url, fallback) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/');
    const name = parts[parts.length - 1];
    return name || fallback;
  } catch {
    return fallback;
  }
}

async function buildZip(analysisData) {
  const zip = new JSZip();
  const { images, videos, svgs, cssFiles, jsFiles, screenshots, meta, fonts, techStack, colors } = analysisData;

  if (meta) {
    zip.file('metadata.json', JSON.stringify(meta, null, 2));
  }
  if (fonts) {
    zip.file('fonts.json', JSON.stringify(fonts, null, 2));
  }
  if (techStack) {
    zip.file('techstack.json', JSON.stringify(techStack, null, 2));
  }
  if (colors) {
    zip.file('colors.json', JSON.stringify(colors, null, 2));
  }

  const imgFolder = zip.folder('images');
  const fetchImgs = (images || []).slice(0, 20).map(async (img, i) => {
    const data = await fetchBinary(img.url);
    if (data) {
      const name = getFilename(img.url, `image_${i}.jpg`);
      imgFolder.file(name, data);
    }
  });

  const vidFolder = zip.folder('videos');
  const fetchVids = (videos || []).slice(0, 5).map(async (vid, i) => {
    const data = await fetchBinary(vid.url);
    if (data) {
      const name = getFilename(vid.url, `video_${i}.mp4`);
      vidFolder.file(name, data);
    }
  });

  const svgFolder = zip.folder('svg');
  (svgs || []).slice(0, 20).forEach((svg, i) => {
    if (svg.url) {
      // fetch async below
    } else if (svg.content) {
      svgFolder.file(`inline_svg_${i}.svg`, svg.content);
    }
  });
  const fetchSvgs = (svgs || []).filter((s) => s.url).slice(0, 20).map(async (svg, i) => {
    const data = await fetchBinary(svg.url);
    if (data) {
      const name = getFilename(svg.url, `svg_${i}.svg`);
      svgFolder.file(name, data);
    }
  });

  const cssFolder = zip.folder('css');
  const fetchCss = (cssFiles || []).slice(0, 10).map(async (css, i) => {
    const data = await fetchBinary(css.url);
    if (data) {
      const name = getFilename(css.url, `style_${i}.css`);
      cssFolder.file(name, data);
    }
  });

  const jsFolder = zip.folder('js');
  const fetchJs = (jsFiles || []).slice(0, 10).map(async (js, i) => {
    const data = await fetchBinary(js.url);
    if (data) {
      const name = getFilename(js.url, `script_${i}.js`);
      jsFolder.file(name, data);
    }
  });

  const screenshotFolder = zip.folder('screenshots');
  if (screenshots?.desktopBase64) {
    screenshotFolder.file('desktop.png', Buffer.from(screenshots.desktopBase64, 'base64'));
  }
  if (screenshots?.mobileBase64) {
    screenshotFolder.file('mobile.png', Buffer.from(screenshots.mobileBase64, 'base64'));
  }

  await Promise.allSettled([...fetchImgs, ...fetchVids, ...fetchSvgs, ...fetchCss, ...fetchJs]);

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

module.exports = { buildZip };
