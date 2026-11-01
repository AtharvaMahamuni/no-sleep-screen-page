import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');

async function generate() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. Apple Touch Icon (180x180)
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 180px;
      height: 180px;
      background: #121210;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .orb {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: radial-gradient(circle, #f54e00 0%, #d04200 70%, rgba(208,66,0,0.4) 100%);
      box-shadow: 0 0 30px rgba(245, 78, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #ffffff;
    }
  </style>
</head>
<body>
  <div class="orb">
    <div class="dot"></div>
  </div>
</body>
</html>`);
  await page.screenshot({ path: path.join(publicDir, 'apple-touch-icon.png') });
  console.log('Generated apple-touch-icon.png (180x180)');

  // 2. Icon 192 (192x192)
  await page.setViewportSize({ width: 192, height: 192 });
  await page.setContent(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 192px;
      height: 192px;
      background: #121210;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .orb {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: radial-gradient(circle, #f54e00 0%, #d04200 70%, rgba(208,66,0,0.4) 100%);
      box-shadow: 0 0 35px rgba(245, 78, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dot {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #ffffff;
    }
  </style>
</head>
<body>
  <div class="orb">
    <div class="dot"></div>
  </div>
</body>
</html>`);
  await page.screenshot({ path: path.join(publicDir, 'icon-192.png') });
  console.log('Generated icon-192.png (192x192)');

  // 3. Icon 512 (512x512)
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 512px;
      height: 512px;
      background: #121210;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .orb {
      width: 256px;
      height: 256px;
      border-radius: 50%;
      background: radial-gradient(circle, #f54e00 0%, #d04200 70%, rgba(208,66,0,0.4) 100%);
      box-shadow: 0 0 80px rgba(245, 78, 0, 0.65);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dot {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: #ffffff;
    }
  </style>
</head>
<body>
  <div class="orb">
    <div class="dot"></div>
  </div>
</body>
</html>`);
  await page.screenshot({ path: path.join(publicDir, 'icon-512.png') });
  console.log('Generated icon-512.png (512x512)');

  // 4. OpenGraph Social Card (1200x630)
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 630px;
      background-color: #f7f7f4;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #26251e;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 72px;
      position: relative;
      overflow: hidden;
    }
    .frame-border {
      position: absolute;
      inset: 20px;
      border: 1px solid #e6e5e0;
      border-radius: 16px;
      pointer-events: none;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 1;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-badge {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #121210;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .logo-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #f54e00;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 700;
      color: #26251e;
    }
    .badge-tag {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 6px 14px;
      background: #fafaf7;
      border: 1px solid #cfcdc4;
      border-radius: 20px;
      color: #5a5852;
    }
    .main {
      margin-top: 10px;
      z-index: 1;
    }
    .headline {
      font-size: 54px;
      font-weight: 600;
      line-height: 1.15;
      letter-spacing: -1.5px;
      color: #26251e;
      max-width: 980px;
      margin-bottom: 24px;
    }
    .subhead {
      font-size: 22px;
      color: #5a5852;
      line-height: 1.45;
      max-width: 860px;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 1;
      padding-top: 10px;
    }
    .pills {
      display: flex;
      gap: 12px;
    }
    .pill {
      font-size: 14px;
      font-weight: 500;
      color: #5a5852;
      background: #ffffff;
      border: 1px solid #e6e5e0;
      padding: 6px 14px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pill-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #f54e00;
    }
    .domain {
      font-size: 16px;
      font-weight: 600;
      color: #f54e00;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="frame-border"></div>
  <div class="header">
    <div class="brand">
      <div class="logo-badge">
        <div class="logo-dot"></div>
      </div>
      <span class="brand-title">NoSleep</span>
    </div>
    <span class="badge-tag">Zero-Install · Ambient Space</span>
  </div>
  <div class="main">
    <h1 class="headline">Keep your screen awake, find your focus and explore ambient experiences.</h1>
    <p class="subhead">A calm digital space combining standards-compliant Screen Wake Lock, Web Audio soundscapes, and calming generative visuals in your browser.</p>
  </div>
  <div class="footer">
    <div class="pills">
      <div class="pill"><span class="pill-dot"></span> Screen Wake Lock</div>
      <div class="pill"><span class="pill-dot"></span> Rain &amp; Brown Noise</div>
      <div class="pill"><span class="pill-dot"></span> Focus &amp; Breathing</div>
      <div class="pill"><span class="pill-dot"></span> 100% Client-Side</div>
    </div>
    <span class="domain">nosleeppage.com</span>
  </div>
</body>
</html>`);
  await page.screenshot({ path: path.join(publicDir, 'og-image.png') });
  console.log('Generated og-image.png (1200x630)');

  // Also copy apple-touch-icon to favicon.ico fallback
  const iconBuffer = await page.screenshot({ clip: { x: 0, y: 0, width: 32, height: 32 } });
  import('node:fs').then(({ copyFileSync }) => {
    copyFileSync(path.join(publicDir, 'apple-touch-icon.png'), path.join(publicDir, 'favicon.ico'));
  });

  await browser.close();
  console.log('All static assets generated successfully.');
}

generate().catch((err) => {
  console.error('Asset generation error:', err);
  process.exit(1);
});
