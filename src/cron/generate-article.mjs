/**
 * generate-article.mjs
 * Queue-based article publisher for YourGutHealed.com.
 *
 * Logic:
 * 1. Check how many articles are published (determines phase).
 * 2. If queue has articles, publish the oldest queued one.
 * 3. If queue is empty, generate a new article fresh, then publish it immediately.
 *
 * Called by start-with-cron.mjs on the phase-based schedule.
 */

import { query } from '../lib/db.mjs';
import { generateArticle, generateMeta, estimateReadingTime, slugify } from '../lib/deepseek-generate.mjs';
import { assignHeroImage } from '../lib/bunny.mjs';

export async function publishNextArticle() {
  console.log('[generate-article] Starting article publisher run...');

  try {
    // ── Check published count ─────────────────────────────────────────────────
    const countRes = await query(
      `SELECT COUNT(*) as cnt FROM articles WHERE status = 'published'`,
      []
    );
    const publishedCount = parseInt(countRes.rows[0].cnt, 10);
    console.log(`[generate-article] Published count: ${publishedCount}`);

    // ── Try to pull from queue first ──────────────────────────────────────────
    const queueRes = await query(
      `SELECT id, slug, title, body, meta_description, category, image_url
       FROM articles
       WHERE status = 'queued'
       ORDER BY queued_at ASC
       LIMIT 1`,
      []
    );

    if (queueRes.rows.length > 0) {
      const article = queueRes.rows[0];
      console.log(`[generate-article] Publishing from queue: "${article.title}"`);

      // Assign a fresh hero image with a unique article-specific URL
      const imageUrl = await assignHeroImage(article.slug);

      await query(
        `UPDATE articles
         SET status = 'published',
             published_at = NOW(),
             image_url = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [imageUrl, article.id]
      );

      console.log(`[generate-article] Published: "${article.title}" -> ${imageUrl}`);
      return { ok: true, action: 'published_from_queue', title: article.title };
    }

    // ── Queue is empty — generate a new article on the fly ───────────────────
    console.log('[generate-article] Queue empty — generating new article...');

    const existingRes = await query(`SELECT title FROM articles`, []);
    const existingTitles = new Set(existingRes.rows.map(r => r.title.toLowerCase()));

    const FALLBACK_TOPICS = [
      { title: `Gut Health Insights for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, category: 'gut-repair' },
      { title: "The Gut Symptom You're Ignoring That Matters Most", category: 'ibs' },
      { title: "What Your Gut Is Trying to Tell You Right Now", category: 'emotional-roots' },
      { title: "The One Gut Health Habit That Changes Everything", category: 'gut-repair' },
      { title: "Why Your Gut Healing Isn't Working (And What to Try Instead)", category: 'gut-repair' },
      { title: "How to Reset Your Gut in 30 Days", category: 'gut-repair' },
      { title: "The Gut Health Mistake Most People Make", category: 'gut-repair' },
    ];

    const topic = FALLBACK_TOPICS.find(t => !existingTitles.has(t.title.toLowerCase()))
      || { title: `Gut Health: ${new Date().toISOString().split('T')[0]}`, category: 'gut-repair' };

    const result = await generateArticle(topic.title, topic.category);

    if (!result.ok || !result.html) {
      console.error(`[generate-article] Generation failed for: "${topic.title}"`);
      return { ok: false, action: 'generation_failed', title: topic.title };
    }

    const slug = slugify(topic.title);
    const meta = await generateMeta(topic.title, result.html);
    const readingTime = estimateReadingTime(result.html);
    const wordCount = result.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
    const imageUrl = await assignHeroImage(slug);

    await query(
      `INSERT INTO articles
        (slug, title, body, meta_description, og_title, og_description,
         category, image_url, image_alt, reading_time, word_count,
         status, queued_at, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'published',NOW(),NOW())
       ON CONFLICT (slug) DO NOTHING`,
      [
        slug, topic.title, result.html, meta, topic.title, meta,
        topic.category, imageUrl, `${topic.title} - gut health article`,
        readingTime, wordCount
      ]
    );

    console.log(`[generate-article] Generated and published: "${topic.title}"`);
    return { ok: true, action: 'generated_and_published', title: topic.title };

  } catch (err) {
    console.error('[generate-article] Error:', err);
    return { ok: false, error: err.message };
  }
}

// Alias for backward compatibility
export const generateDailyArticle = publishNextArticle;
