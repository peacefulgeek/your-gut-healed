import { generateArticle } from '../lib/anthropic-generate.mjs';
import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { query } from '../lib/db.mjs';
import { uploadArticleImage } from '../lib/bunny.mjs';
import { generateHeroImage } from '../lib/fal-images.mjs';

const DAILY_TOPICS = [
  { title: 'How to Calm an IBS Flare in 24 Hours', category: 'ibs', tags: ['ibs', 'flare', 'practical'] },
  { title: 'The Best Probiotic Foods for Gut Healing', category: 'microbiome', tags: ['probiotics', 'fermented-foods', 'microbiome'] },
  { title: 'Why Your Gut Hurts After Eating Healthy Foods', category: 'ibs', tags: ['ibs', 'fodmap', 'food-sensitivity'] },
  { title: 'The Gut-Thyroid Connection: What Nobody Tells You', category: 'gut-health', tags: ['thyroid', 'gut-health', 'autoimmune'] },
  { title: 'Stress and Constipation: The Nervous System Link', category: 'emotional-roots', tags: ['constipation', 'stress', 'nervous-system'] },
  { title: 'SIBO vs. Candida: How to Tell the Difference', category: 'sibo', tags: ['sibo', 'candida', 'diagnosis'] },
  { title: 'The Best Supplements for Leaky Gut (Ranked)', category: 'gut-repair', tags: ['leaky-gut', 'supplements', 'gut-repair'] },
  { title: 'Why Antibiotics Wreck Your Gut and How to Recover', category: 'microbiome', tags: ['antibiotics', 'microbiome', 'recovery'] },
  { title: 'Gut Health and Depression: The Serotonin Connection', category: 'gut-brain', tags: ['depression', 'serotonin', 'gut-brain'] },
  { title: 'The Elimination Diet: A Week-by-Week Guide', category: 'diet', tags: ['elimination-diet', 'food-sensitivity', 'practical'] }
];

const MAX_ATTEMPTS = 3;

export async function generateDailyArticle() {
  console.log('[generate-article] Starting daily article generation');

  // Pick a topic not yet in DB
  let topic = null;
  for (const t of DAILY_TOPICS) {
    const { rows } = await query('SELECT id FROM articles WHERE title = $1', [t.title]);
    if (rows.length === 0) {
      topic = t;
      break;
    }
  }

  if (!topic) {
    // Generate a fresh topic if all daily topics are used
    topic = {
      title: `Gut Health Insight: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
      category: 'gut-health',
      tags: ['gut-health', 'practical']
    };
  }

  console.log(`[generate-article] Topic: ${topic.title}`);

  let ok = false;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS && !ok; attempt++) {
    try {
      const article = await generateArticle({
        topic: topic.title,
        topicIndex: Date.now() % 30,
        category: topic.category,
        tags: topic.tags
      });

      const gate = runQualityGate(article.body);
      if (!gate.passed) {
        console.warn(`[generate-article] Attempt ${attempt} failed gate: ${gate.failures.join(', ')}`);
        continue;
      }

      let imageUrl = `https://yourgut-healed.b-cdn.net/images/placeholder-gut.webp`;
      try {
        const imageBuffer = await generateHeroImage(topic.title, topic.category);
        imageUrl = await uploadArticleImage(imageBuffer, article.slug);
      } catch (imgErr) {
        console.warn(`[generate-article] Image failed: ${imgErr.message}`);
      }

      await query(`
        INSERT INTO articles (
          slug, title, body, meta_description, og_title, og_description,
          category, tags, image_url, image_alt, reading_time, author,
          published, published_at, word_count, asins_used, cta_primary,
          opener_type, conclusion_type
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
        ON CONFLICT (slug) DO NOTHING
      `, [
        article.slug, article.title, article.body, article.metaDescription,
        article.ogTitle, article.ogDescription, article.category, article.tags,
        imageUrl, article.imageAlt, article.readingTime, article.author,
        true, new Date().toISOString(), article.wordCount, article.asinsUsed,
        article.ctaPrimary, article.openerType, article.conclusionType
      ]);

      console.log(`[generate-article] Stored: ${article.slug} (${article.wordCount} words)`);
      ok = true;
    } catch (err) {
      console.error(`[generate-article] Attempt ${attempt} error:`, err.message);
    }
  }

  if (!ok) {
    console.error('[generate-article] FAILED all attempts — not storing');
  }

  return { ok };
}
