const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const filePath = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');

  const consoleErrors = [];
  const failedRequests = [];

  const viewports = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 },
  };

  for (const [name, viewport] of Object.entries(viewports)) {
    const page = await browser.newPage({ viewport });
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(`[${name}] ${msg.text()}`); });
    page.on('requestfailed', req => failedRequests.push(`[${name}] ${req.url()} - ${req.failure()?.errorText}`));

    await page.goto(filePath, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(__dirname, `qa-${name}-top.png`) });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.4));
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(__dirname, `qa-${name}-mid.png`) });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(__dirname, `qa-${name}-bottom.png`) });

    await page.close();
  }

  console.log('CONSOLE ERRORS:', JSON.stringify(consoleErrors, null, 2));
  console.log('FAILED REQUESTS:', JSON.stringify(failedRequests, null, 2));

  await browser.close();
})();
