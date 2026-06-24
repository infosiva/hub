#!/usr/bin/env node
// Grabs mobile screenshots for every hub-registered product via Playwright (local, no rate limit).
// Output: public/screenshots/<id>-mobile.jpg

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'screenshots');
mkdirSync(OUT_DIR, { recursive: true });

const args = process.argv.slice(2);
const get = (k, def = null) => { const i = args.indexOf(k); return i !== -1 ? args[i + 1] : def; };
const FILTER = get('--filter', null)?.split(',').map(s => s.trim());

const sitesSrc = readFileSync(join(__dirname, '..', 'lib', 'sites.ts'), 'utf8');
const re = /id:\s*"([^"]+)"[\s\S]*?url:\s*"([^"]+)"/g;
let SITES = [];
let m;
while ((m = re.exec(sitesSrc))) SITES.push({ id: m[1], url: m[2] });
if (FILTER) SITES = SITES.filter(s => FILTER.includes(s.id));

console.log(`=== Screenshot grabber (Playwright) — ${SITES.length} sites ===`);
console.log(`Output dir: ${OUT_DIR}\n`);

const browser = await chromium.launch({ headless: true });

for (const { id, url } of SITES) {
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1200); // let hero animations settle
    const buffer = await page.screenshot({ type: 'jpeg', quality: 80 });
    writeFileSync(join(OUT_DIR, `${id}-mobile.jpg`), buffer);
    console.log(`  ✓ ${id} (${(buffer.length / 1024).toFixed(0)} KB)`);
    await page.close();
  } catch (err) {
    console.error(`  ✗ ${id}: ${err.message.split('\n')[0]}`);
  }
}

await browser.close();
console.log('\n=== Done ===');
console.log(`Open ${OUT_DIR} to find your screenshots.`);
