import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { verifyAsin, extractAsinsFromText } from '../lib/amazon-verify.mjs';
import { generateQuarterlyRefresh } from '../lib/anthropic-generate.mjs';
import { query } from '../lib/db.mjs';

const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 15;

export async function refreshQuarterly() {
  const { rows } = await query(`
    SELECT id, slug, title, body, category, tags, asins_used
    FROM articles
    WHERE last_refreshed_90d IS NULL OR last_refreshed_90d < NOW() - INTERVAL '90 days'
    ORDER BY COALESCE(last_refreshed_90d, published_at) ASC
    LIMIT $1
  `, [BATCH_SIZE]);

  console.log(`[refresh-quarterly] Processing ${rows.length} articles`);
  let refreshed = 0, kept = 0;

  for (const a of rows) {
    let refreshedBody = null;
    let gate = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      refreshedBody = await generateQuarterlyRefresh(a);

      const asins = extractAsinsFromText(refreshedBody);
      const dead = (await Promise.all(asins.map(verifyAsin))).filter(r => !r.valid);
      if (dead.length > 0) {
        console.warn(`[refresh-quarterly] ${a.slug}: ${dead.length} dead ASINs`);
      }

      gate = runQualityGate(refreshedBody);
      if (gate.passed) break;
      console.warn(`[refresh-quarterly] ${a.slug} attempt ${attempt}:`, gate.failures.join(' | '));
    }

    if (gate && gate.passed) {
      await query(
        'UPDATE articles SET body = $1, asins_used = $2, word_count = $3, last_refreshed_90d = NOW(), updated_at = NOW() WHERE id = $4',
        [refreshedBody, gate.asins, gate.wordCount, a.id]
      );
      refreshed++;
    } else {
      await query('UPDATE articles SET last_refreshed_90d = NOW() WHERE id = $1', [a.id]);
      kept++;
      console.error(`[refresh-quarterly] ${a.slug} FAILED gate 3x — keeping original`);
    }
  }

  return { processed: rows.length, refreshed, kept };
}
