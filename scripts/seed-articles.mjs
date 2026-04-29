/**
 * seed-articles.mjs — DEPRECATED
 * Superseded by scripts/bulk-seed.mjs (500 articles, DeepSeek V4-Pro, queue-based).
 * This stub redirects for backward compatibility.
 */
console.log('[seed-articles] This script is deprecated. Redirecting to bulk-seed.mjs...');
const { default: url } = await import('url');
const { default: path } = await import('path');
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
await import(path.join(__dirname, 'bulk-seed.mjs'));
