/**
 * refresh-quarterly.mjs
 * Quarterly deep article refresh for YourGutHealed.com.
 * Rewrites published articles that haven't been deep-refreshed in 90+ days.
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
const BATCH_SIZE = 15;

export async function refreshQuarterly() {
  console.log('[refresh-quarterly] Starting quarterly deep refresh...');

  const { rows } = await query(`
    SELECT id, slug, title, body, category, tags, asins_used
    FROM articles
    WHERE status = 'published'
      AND (last_refreshed_90d IS NULL OR last_refreshed_90d < NOW() - INTERVAL '90 days')
    ORDER BY COALESCE(last_refreshed_90d, published_at) ASC
    LIMIT $1
  `, [BATCH_SIZE]);

  console.log(`[refresh-quarterly] Processing ${rows.length} articles`);
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
              content: `You are a compassionate gut health writer doing a deep quarterly rewrite of an existing article.
This is a full rewrite - not just an update. Keep the same topic and all Amazon affiliate links exactly as they appear.
Bring fresh perspective, new structure, updated research context, and improved readability.
Never use em-dashes. Never use banned words: utilize, delve, tapestry, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore.
Word count: 1,200 to 2,500 words. Use contractions. Direct address ("you") throughout. Include 2-3 conversational markers.`
            },
            {
              role: 'user',
              content: `Do a deep quarterly rewrite of this gut health article. Keep all Amazon affiliate links exactly as-is. Bring fresh structure and perspective.

Title: "${article.title}"
Category: ${article.category}

Current content:
${article.body.slice(0, 3000)}

Return ONLY the rewritten HTML body (no <html>, <head>, <body> tags, no H1 title).`
            }
          ],
          temperature: 0.75,
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
          console.warn(`[refresh-quarterly] ${article.slug} attempt ${attempt} failed:`, gate.errors.join('; '));
        }
      } catch (err) {
        console.error(`[refresh-quarterly] ${article.slug} attempt ${attempt} error:`, err.message);
      }
    }

    if (finalHtml) {
      const wordCount = finalHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
      await query(
        `UPDATE articles
         SET body = $1, word_count = $2, last_refreshed_90d = NOW(), updated_at = NOW()
         WHERE id = $3`,
        [finalHtml, wordCount, article.id]
      );
      refreshed++;
      console.log(`[refresh-quarterly] Deep refreshed: ${article.slug}`);
    } else {
      await query(
        `UPDATE articles SET last_refreshed_90d = NOW() WHERE id = $1`,
        [article.id]
      );
      kept++;
      console.error(`[refresh-quarterly] ${article.slug} FAILED gate 3x — keeping original`);
    }
  }

  console.log(`[refresh-quarterly] Done. Refreshed: ${refreshed}, Kept: ${kept}`);
  return { processed: rows.length, refreshed, kept };
}
