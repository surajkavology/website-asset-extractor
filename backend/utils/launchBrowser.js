const { chromium } = require('playwright');

// Required for Playwright to run inside Docker/Railway containers.
// Without --no-sandbox the process crashes immediately on Linux.
const CHROMIUM_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
  '--disable-gpu',
];

async function launchBrowser() {
  return chromium.launch({ headless: true, args: CHROMIUM_ARGS });
}

module.exports = { launchBrowser };
