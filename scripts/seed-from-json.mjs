#!/usr/bin/env node
/**
 * seed-from-json.mjs
 * Fast-imports pre-generated articles from articles-seed.json into PostgreSQL.
 * All articles are inserted with status='queued' — cron promotes them on schedule.
 *
 * Usage:
 *   node scripts/seed-from-json.mjs
 *   pnpm seed-from-json
 *
 * Requires: DATABASE_URL env var.
 * The manifest at src/data/articles-seed.json must exist.
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve as resolvePath } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolvePath(__dirname, '..');

// ─── Load manifest ────────────────────────────────────────────────────────────
const MANIFEST_PATH = resolvePath(projectRoot, 'src/data/articles-seed.json');
let articles;
try {
  articles = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
  console.log(`[seed-from-json] Loaded ${articles.length} articles from manifest`);
} catch (err) {
  console.error('[seed-from-json] Failed to load manifest:', err.message);
  process.exit(1);
}

// ─── DB helpers ───────────────────────────────────────────────────────────────
const { query, initDb, close } = await import('../src/lib/db.mjs');

// ─── Fetch body from Bunny CDN if not in manifest ────────────────────────────
async function fetchBodyFromCDN(cdnUrl) {
  try {
    const res = await fetch(cdnUrl);
    if (!res.ok) return null;
    const data = await res.json();
    return data.html || data.body || null;
  } catch {
    return null;
  }
}

// ─── Estimate reading time from word count ────────────────────────────────────
function estimateReadingTime(wordCount) {
  return Math.max(5, Math.round(wordCount / 230));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seedFromJson() {
  console.log('[seed-from-json] Connecting to database...');
  await initDb();

  // Get existing slugs to avoid duplicates
  const existingRes = await query(`SELECT slug FROM articles`, []);
  const existingSlugs = new Set(existingRes.rows.map(r => r.slug));
  console.log(`[seed-from-json] ${existingSlugs.size} articles already in DB`);

  let inserted = 0;
  let skipped = 0;
  let failed = 0;
  let fetchedFromCDN = 0;

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const slug = a.slug;
    const title = a.title;

    if (!slug || !title) {
      console.warn(`[seed-from-json] [${i+1}/${articles.length}] SKIP: missing slug or title`);
      skipped++;
      continue;
    }

    if (existingSlugs.has(slug)) {
      skipped++;
      continue;
    }

    // Get the HTML body
    let body = a.html || a.body || null;

    // If no body in manifest, try to fetch from CDN
    if (!body && a.cdn_url) {
      body = await fetchBodyFromCDN(a.cdn_url);
      if (body) {
        fetchedFromCDN++;
      }
    }

    // If still no body, use a placeholder — cron will regenerate when publishing
    if (!body) {
      body = `<p><em>Article content loading...</em></p>`;
    }

    const category = a.category || 'gut-health';
    const imageUrl = a.image_url || `https://yourgut-healed.b-cdn.net/library/lib-${((i % 40) + 1).toString().padStart(2,'0')}.webp`;
    const imageAlt = `${title} - gut health article`;
    const wordCount = a.word_count || 0;
    const readingTime = a.reading_time || estimateReadingTime(wordCount);
    const excerpt = a.excerpt || '';

    try {
      await query(
        `INSERT INTO articles
          (slug, title, body, meta_description, og_title, og_description,
           category, image_url, image_alt, reading_time, word_count,
           status, queued_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'queued',NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [
          slug,
          title,
          body,
          excerpt || title,
          title,
          excerpt || title,
          category,
          imageUrl,
          imageAlt,
          readingTime,
          wordCount
        ]
      );
      inserted++;
      existingSlugs.add(slug);

      if (inserted % 50 === 0) {
        console.log(`[seed-from-json] Progress: ${inserted} inserted, ${skipped} skipped, ${failed} failed`);
      }
    } catch (err) {
      console.error(`[seed-from-json] [${i+1}] ERROR inserting "${title}":`, err.message);
      failed++;
    }
  }

  console.log(`\n[seed-from-json] ✅ COMPLETE`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Skipped (already in DB): ${skipped}`);
  console.log(`  Fetched from CDN: ${fetchedFromCDN}`);
  console.log(`  Failed: ${failed}`);

  // Verify final count
  const finalRes = await query(`SELECT COUNT(*) as cnt FROM articles WHERE status = 'queued'`, []);
  console.log(`  Queued in DB: ${finalRes.rows[0].cnt}`);

  await close();
}

seedFromJson().catch(err => {
  console.error('[seed-from-json] Fatal error:', err);
  process.exit(1);
});
