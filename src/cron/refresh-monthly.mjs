/**
 * refresh-monthly.mjs
 * Monthly article refresh for YourGutHealed.com.
 * Refreshes published articles that haven't been updated in 30+ days.
 * Uses DeepSeek V4-Pro via OpenAI client.
 */

import OpenAI from 'openai';
import { query } from '../lib/db.mjs';
import { runPaulVoiceGate } from '../lib/deepseek-generate.mjs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});
const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';

const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 10;

export async function refreshMonthly() {
  console.log('[refresh-monthly] Starting monthly refresh...');

  const { rows } = await query(`
    SELECT id, slug, title, body, category, tags, asins_used
    FROM articles
    WHERE status = 'published'
      AND (last_refreshed_30d IS NULL OR last_refreshed_30d < NOW() - INTERVAL '30 days')
    ORDER BY COALESCE(last_refreshed_30d, published_at) ASC
    LIMIT $1
  `, [BATCH_SIZE]);

  console.log(`[refresh-monthly] Processing ${rows.length} articles`);
  let refreshed = 0;
  let kept = 0;

  for (const article of rows) {
    let finalHtml = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await client.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: `You are a compassionate gut health writer. You are refreshing an existing article to keep it current and accurate.
Preserve all Amazon affiliate links exactly as they appear. Keep the same structure but update any outdated information.
Never use em-dashes. Never use banned words: utilize, delve, tapestry, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore.
Keep word count between 1,200 and 2,500 words. Use contractions. Direct address ("you") throughout.`
            },
            {
              role: 'user',
              content: `Refresh this gut health article. Keep all Amazon affiliate links exactly as-is. Update any outdated information. Keep the same topic and structure.

Title: "${article.title}"
Category: ${article.category}

Current content:
${article.body.slice(0, 3000)}

Return ONLY the refreshed HTML body (no <html>, <head>, <body> tags, no H1 title).`
            }
          ],
          temperature: 0.65,
          max_tokens: 4096
        });

        let html = response.choices[0]?.message?.content?.trim() || '';
        html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();
        html = html.replace(/\u2014/g, ' - ').replace(/\u2013/g, ' - ');

        const gate = runPaulVoiceGate(html);
        if (gate.pass) {
          finalHtml = gate.normalized;
          break;
        } else {
          console.warn(`[refresh-monthly] ${article.slug} attempt ${attempt} failed:`, gate.errors.join('; '));
        }
      } catch (err) {
        console.error(`[refresh-monthly] ${article.slug} attempt ${attempt} error:`, err.message);
      }
    }

    if (finalHtml) {
      const wordCount = finalHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
      await query(
        `UPDATE articles
         SET body = $1, word_count = $2, last_refreshed_30d = NOW(), updated_at = NOW()
         WHERE id = $3`,
        [finalHtml, wordCount, article.id]
      );
      refreshed++;
      console.log(`[refresh-monthly] Refreshed: ${article.slug}`);
    } else {
      // Mark as attempted so we don't retry immediately
      await query(
        `UPDATE articles SET last_refreshed_30d = NOW() WHERE id = $1`,
        [article.id]
      );
      kept++;
      console.error(`[refresh-monthly] ${article.slug} FAILED gate 3x — keeping original`);
    }
  }

  console.log(`[refresh-monthly] Done. Refreshed: ${refreshed}, Kept: ${kept}`);
  return { processed: rows.length, refreshed, kept };
}
