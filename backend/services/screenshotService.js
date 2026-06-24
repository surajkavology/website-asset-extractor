const { chromium } = require('playwright');

async function takeScreenshots(url) {
  const browser = await chromium.launch({ headless: true });
  let desktopBase64 = null;
  let mobileBase64 = null;

  try {
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await desktopPage.waitForTimeout(1500);
    const desktopBuffer = await desktopPage.screenshot({ fullPage: false, type: 'png' });
    desktopBase64 = desktopBuffer.toString('base64');
    await desktopContext.close();

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage.waitForTimeout(1500);
    const mobileBuffer = await mobilePage.screenshot({ fullPage: false, type: 'png' });
    mobileBase64 = mobileBuffer.toString('base64');
    await mobileContext.close();
  } finally {
    await browser.close();
  }

  return { desktopBase64, mobileBase64 };
}

module.exports = { takeScreenshots };
