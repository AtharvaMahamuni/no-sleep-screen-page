import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const errors = [];
const warnings = [];

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

if (!existsSync(dist)) {
  console.error('[Quality Guardian] dist/ directory does not exist! Run build first.');
  process.exit(1);
}

const allFiles = walk(dist);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));

console.log(`[Quality Guardian] Auditing ${htmlFiles.length} generated HTML pages in dist/...`);

// 1. Mandatory Root Files Audit
const mandatoryFiles = ['CNAME', '.nojekyll', 'robots.txt', 'sitemap.xml', 'llms.txt', 'site.webmanifest'];
for (const file of mandatoryFiles) {
  if (!existsSync(path.join(dist, file))) {
    errors.push(`Missing mandatory public file in dist/: ${file}`);
  }
}

// 2. Page Metadata & Semantic Hierarchy Audit
for (const htmlFile of htmlFiles) {
  const relPath = path.relative(dist, htmlFile);
  const content = readFileSync(htmlFile, 'utf8');

  // Title tag
  const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    errors.push(`${relPath}: Missing or empty <title> tag`);
  }

  // Meta description
  const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (!descMatch || !descMatch[1].trim()) {
    errors.push(`${relPath}: Missing or empty <meta name="description"> tag`);
  }

  // Canonical link
  const canonicalMatch = content.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  if (!canonicalMatch || !canonicalMatch[1].trim()) {
    errors.push(`${relPath}: Missing <link rel="canonical"> tag`);
  } else if (!canonicalMatch[1].startsWith('https://nosleeppage.com')) {
    errors.push(`${relPath}: Invalid canonical domain (must start with https://nosleeppage.com)`);
  }

  // JSON-LD Scripts validation
  const jsonLdMatches = content.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      errors.push(`${relPath}: Invalid JSON-LD block syntax: ${e.message}`);
    }
  }

  // Internal Link Integrity
  const linkMatches = content.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi);
  for (const lm of linkMatches) {
    const href = lm[1];
    if (href.startsWith('/') && !href.startsWith('//')) {
      const cleanHref = href.split('#')[0].split('?')[0];
      if (cleanHref && cleanHref !== '/') {
        // Resolve target file
        const directFile = path.join(dist, cleanHref);
        const stripped = cleanHref.replace(/\/$/, '');
        const htmlFileTarget = path.join(dist, `${stripped}.html`);
        const indexFileTarget = path.join(dist, cleanHref, 'index.html');

        const resolved =
          existsSync(directFile) ||
          existsSync(htmlFileTarget) ||
          existsSync(indexFileTarget) ||
          (cleanHref === '/404/' && existsSync(path.join(dist, '404.html')));
        if (!resolved) {
          errors.push(`${relPath}: Broken internal link to "${href}"`);
        }
      }
    }
  }
}

if (warnings.length) {
  console.log('\nWarnings:');
  warnings.forEach(w => console.warn(' - ' + w));
}

if (errors.length) {
  console.error('\n[Quality Guardian] Quality Gate Failed with Errors:');
  errors.forEach(e => console.error(' ✗ ' + e));
  process.exit(1);
}

console.log('[Quality Guardian] ✓ 100% Quality, SEO, Canonical, and Schema criteria satisfied.');
