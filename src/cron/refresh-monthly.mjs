import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { verifyAsin, extractAsinsFromText } from '../lib/amazon-verify.mjs';
import { generateMonthlyRefresh } from '../lib/anthropic-generate.mjs';
import { query } from '../lib/db.mjs';

const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 10;

export async function refreshMonthly() {
  const { rows } = await query(`
    SELECT id, slug, title, body, category, tags, asins_used
    FROM articles
    WHERE last_refreshed_30d IS NULL OR last_refreshed_30d < NOW() - INTERVAL '30 days'
    ORDER BY COALESCE(last_refreshed_30d, published_at) ASC
    LIMIT $1
  `, [BATCH_SIZE]);

  console.log(`[refresh-monthly] Processing ${rows.length} articles`);
  let refreshed = 0, kept = 0;

  for (const a of rows) {
    let refreshedBody = null;
    let gate = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      refreshedBody = await generateMonthlyRefresh(a);

      const asins = extractAsinsFromText(refreshedBody);
      const dead = (await Promise.all(asins.map(verifyAsin))).filter(r => !r.valid);
      if (dead.length > 0) {
        console.warn(`[refresh-monthly] ${a.slug}: ${dead.length} dead ASINs`);
      }

      gate = runQualityGate(refreshedBody);
      if (gate.passed) break;
      console.warn(`[refresh-monthly] ${a.slug} attempt ${attempt}:`, gate.failures.join(' | '));
    }

    if (gate && gate.passed) {
      await query(
        'UPDATE articles SET body = $1, asins_used = $2, word_count = $3, last_refreshed_30d = NOW(), updated_at = NOW() WHERE id = $4',
        [refreshedBody, gate.asins, gate.wordCount, a.id]
      );
      refreshed++;
      console.log(`[refresh-monthly] refreshed ${a.slug}`);
    } else {
      await query('UPDATE articles SET last_refreshed_30d = NOW() WHERE id = $1', [a.id]);
      kept++;
      console.error(`[refresh-monthly] ${a.slug} FAILED gate 3x — keeping original`);
    }
  }

  return { processed: rows.length, refreshed, kept };
}
