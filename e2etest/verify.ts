import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({ path: 'verify.png' });
  await browser.close();
  console.log('Screenshot saved to verify.png');
})();