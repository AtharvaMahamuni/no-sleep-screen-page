import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const failures = [];
const notes = [];

function gzipLength(buffer) {
  return gzipSync(buffer).length;
}

function walk(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) found.push(...walk(full));
    else found.push(full);
  }
  return found;
}

function linkedAssets(html, extension) {
  const pattern =
    extension === 'js'
      ? /<script\b[^>]*\bsrc="([^"]+\.js)"/g
      : /<link\b[^>]*\bhref="([^"]+\.css)"/g;
  const urls = [];
  for (const match of html.matchAll(pattern)) urls.push(match[1]);
  return urls;
}

function readDistUrl(url) {
  const relative = url.startsWith('/') ? url.slice(1) : url;
  return readFileSync(path.join(dist, relative));
}

const files = walk(dist);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const homePath = path.join(dist, 'index.html');
const home = readFileSync(homePath, 'utf8');

const homeGzip = gzipLength(Buffer.from(home));
notes.push(`home HTML gzip: ${homeGzip} bytes`);
if (homeGzip > 40 * 1024) failures.push(`Home HTML is ${homeGzip} bytes gzipped. The limit is 40 KB.`);

const cssUrls = [...new Set(linkedAssets(home, 'css'))];
let cssGzip = 0;
for (const url of cssUrls) cssGzip += gzipLength(readDistUrl(url));
notes.push(`home CSS gzip: ${cssGzip} bytes across ${cssUrls.length} file(s)`);
if (cssGzip > 25 * 1024) failures.push(`CSS is ${cssGzip} bytes gzipped. The limit is 25 KB.`);

function collectJs(urls, seen = new Set()) {
  for (const url of urls) {
    if (seen.has(url)) continue;
    seen.add(url);
    const source = readDistUrl(url).toString('utf8');
    const specs = [...source.matchAll(/import\s*(?:[^'"\n]+from\s*)?["'](\.[^"']+\.js)["']/g)].map((match) => match[1]);
    const dir = path.posix.dirname(url);
    const next = specs.map((spec) => path.posix.normalize(path.posix.join(dir, spec)));
    collectJs(next, seen);
  }
  return seen;
}

const entryJs = linkedAssets(home, 'js');
const allJs = collectJs(entryJs);
let jsGzip = 0;
for (const url of allJs) jsGzip += gzipLength(readDistUrl(url));
notes.push(`app JS gzip: ${jsGzip} bytes across ${allJs.size} file(s)`);
if (jsGzip > 35 * 1024) notes.push(`Note: JS is ${jsGzip} bytes (budget target: 35 KB).`);
if (jsGzip > 50 * 1024) failures.push(`JS is ${jsGzip} bytes gzipped. The limit is 50 KB.`);

// Security & privacy check: zero trackers or unauthorized ads
const forbidden = [
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.net',
  'hotjar.com',
];

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const token of forbidden) {
    if (html.includes(token)) failures.push(`${path.relative(dist, file)} contains forbidden tracker: ${token}`);
  }
}

for (const line of notes) console.log(line);
if (failures.length) {
  for (const failure of failures) console.error('Budget Failure:', failure);
  process.exit(1);
}
console.log('✓ All asset and performance budgets passed.');
