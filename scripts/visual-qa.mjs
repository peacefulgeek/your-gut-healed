import fs from 'fs/promises';
import path from 'path';

const failures = [];

function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(fg, bg) {
  const l1 = luminance(fg), l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// 1. Contrast check from design tokens
try {
  const css = await fs.readFile('src/client/styles/tokens.css', 'utf8');
  const text = css.match(/--text-primary:\s*(#[0-9a-fA-F]{6})/)?.[1];
  const bg = css.match(/--bg-primary:\s*(#[0-9a-fA-F]{6})/)?.[1];
  if (text && bg) {
    const ratio = contrastRatio(text, bg);
    if (ratio < 4.5) failures.push(`contrast-fail: ${text} on ${bg} = ${ratio.toFixed(2)} (need 4.5)`);
    else console.log(`[visual-qa] Contrast ${ratio.toFixed(2)} OK`);
  } else {
    failures.push('tokens.css missing --text-primary or --bg-primary');
  }
} catch (e) {
  failures.push(`tokens.css not readable: ${e.message}`);
}

// 2. Hero images must be < 200KB
async function walk(dir, results = []) {
  try {
    for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) await walk(full, results);
      else results.push(full);
    }
  } catch {}
  return results;
}

const clientFiles = await walk('dist/client');
for (const f of clientFiles) {
  if (/\.(jpg|jpeg|png|webp|avif)$/i.test(f)) {
    const stat = await fs.stat(f);
    if (stat.size > 200 * 1024) {
      failures.push(`image-oversized: ${path.basename(f)} = ${(stat.size / 1024).toFixed(0)}KB (max 200)`);
    }
  }
}

// 3. No Google Fonts or CloudFront leak in HTML
for (const f of clientFiles.filter(f => f.endsWith('.html'))) {
  const html = await fs.readFile(f, 'utf8');
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html)) {
    failures.push(`google-fonts-leak: ${path.basename(f)}`);
  }
  if (/cloudfront\.net/.test(html)) {
    failures.push(`cloudfront-leak: ${path.basename(f)}`);
  }
}

// 4. No Manus artifacts
const srcFiles = await walk('src');
for (const f of srcFiles) {
  if (!/\.(ts|tsx|js|mjs|jsx)$/.test(f)) continue;
  try {
    const txt = await fs.readFile(f, 'utf8');
    if (/forge\.manus\.im|vite-plugin-manus/.test(txt)) {
      failures.push(`manus-artifact: ${f}`);
    }
  } catch {}
}

// 5. Check tokens.css exists
try {
  await fs.access('src/client/styles/tokens.css');
  console.log('[visual-qa] tokens.css exists OK');
} catch {
  failures.push('tokens.css missing');
}

// Report
if (failures.length > 0) {
  console.error('[visual-qa] FAILED:');
  failures.forEach(f => console.error('  - ' + f));
  process.exit(1);
}
console.log('[visual-qa] All checks passed');
