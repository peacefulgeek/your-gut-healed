import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { verifyAsin, extractAsinsFromText, buildAmazonUrl } from '../lib/amazon-verify.mjs';
import { matchProducts } from '../lib/match-products.mjs';
import { query } from '../lib/db.mjs';
import { uploadArticleImage } from '../lib/bunny.mjs';
import { generateHeroImage } from '../lib/fal-images.mjs';
import { PRODUCT_CATALOG } from '../data/product-catalog.mjs';
import fs from 'fs/promises';
import path from 'path';

const CACHE_PATH = path.resolve('src/data/verified-asins.json');
const MAX_ATTEMPTS = 3;

export async function generateProductSpotlight() {
  console.log('[product-spotlight] Starting');

  let cache;
  try {
    cache = JSON.parse(await fs.readFile(CACHE_PATH, 'utf8'));
  } catch {
    cache = { version: 1, lastUpdated: null, asins: {}, failed: {} };
  }

  // Fall back to catalog if cache is empty
  const catalogAsins = PRODUCT_CATALOG.map(p => ({
    asin: p.asin,
    entry: { title: p.name, category: p.category, tags: p.tags, status: 'valid' }
  }));

  const valid = Object.keys(cache.asins).length > 0
    ? Object.entries(cache.asins).filter(([_, e]) => e.status === 'valid').map(([asin, entry]) => ({ asin, entry }))
    : catalogAsins;

  if (valid.length === 0) {
    console.warn('[product-spotlight] No valid ASINs — aborting');
    return { stored: false, reason: 'no-valid-asins' };
  }

  const sorted = valid
    .map(({ asin, entry }) => ({ asin, entry, lastSpotlight: entry.lastSpotlightedAt || '1970-01-01' }))
    .sort((a, b) => new Date(a.lastSpotlight) - new Date(b.lastSpotlight));
  const target = sorted[0];

  console.log(`[product-spotlight] Target: ${target.asin} (${target.entry.title})`);

  const check = await verifyAsin(target.asin);
  if (!check.valid) {
    console.warn(`[product-spotlight] Target ASIN dead: ${check.reason}`);
    return { stored: false, reason: 'target-asin-dead' };
  }

  let article = null;
  let gate = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    article = await generateSpotlightArticle({
      primaryAsin: target.asin,
      primaryTitle: check.title || target.entry.title,
      primaryCategory: target.entry.category,
      primaryTags: target.entry.tags || []
    });

    gate = runQualityGate(article.body);
    if (gate.passed) break;
    console.warn(`[product-spotlight] Attempt ${attempt} failed:`, gate.failures);
  }

  if (!gate.passed) {
    console.error('[product-spotlight] Abandoned after 3 attempts');
    return { stored: false, reason: 'quality-gate-exhausted', failures: gate.failures };
  }

  let imageUrl = `https://yourgut-healed.b-cdn.net/images/placeholder-gut.webp`;
  try {
    const imageBuffer = await generateHeroImage(article.title, target.entry.category);
    imageUrl = await uploadArticleImage(imageBuffer, article.slug);
  } catch (imgErr) {
    console.warn(`[product-spotlight] Image failed: ${imgErr.message}`);
  }

  await query(`
    INSERT INTO articles (
      slug, title, body, meta_description, og_title, og_description,
      category, tags, image_url, image_alt, reading_time, author,
      published, published_at, word_count, asins_used, cta_primary
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    ON CONFLICT (slug) DO NOTHING
  `, [
    article.slug, article.title, article.body, article.metaDescription,
    article.ogTitle, article.ogDescription, article.category, article.tags,
    imageUrl, article.imageAlt, article.readingTime, article.author,
    true, new Date().toISOString(), article.wordCount, article.asinsUsed,
    article.ctaPrimary
  ]);

  return { stored: true, asin: target.asin, slug: article.slug, wordCount: gate.wordCount };
}

async function generateSpotlightArticle({ primaryAsin, primaryTitle, primaryCategory, primaryTags }) {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const relatedProducts = matchProducts({
    articleTitle: primaryTitle,
    articleTags: primaryTags,
    articleCategory: primaryCategory,
    catalog: PRODUCT_CATALOG.filter(p => p.asin !== primaryAsin),
    minLinks: 2,
    maxLinks: 3
  });

  const productLinks = relatedProducts.map(p =>
    `- ${p.name}: ${buildAmazonUrl(p.asin)} (paid link)`
  ).join('\n');

  const prompt = `You are The Oracle Lover writing for YourGutHealed.com. Write a product spotlight article about: "${primaryTitle}"

Primary product link: ${buildAmazonUrl(primaryAsin)} (paid link) - embed this naturally 1-2 times.

Related products to embed (2-3 more):
${productLinks}

HARD RULES:
- 1,600 to 2,000 words
- Zero em-dashes. Use commas, periods, colons, or parentheses.
- Never use banned words: delve, tapestry, paradigm, synergy, leverage, unlock, empower, utilize, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, comprehensive, transformative, groundbreaking, innovative, cutting-edge, revolutionary, profound, holistic, nuanced, multifaceted, furthermore, moreover, additionally, consequently, subsequently, thereby
- Contractions throughout
- Vary sentence length aggressively
- Direct address ("you") throughout
- 2+ conversational openers: "Here's the thing," "Honestly," "Look," "Truth is"
- Structure: hook, what it is, who it's for, how to use it, what to expect, alternatives, verdict
- End with italicized Sanskrit mantra
- Include health disclaimer and Amazon disclosure
- Author bio at bottom linking to theoraclelover.com

Return clean HTML starting with <h1>.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  const body = message.content[0].type === 'text' ? message.content[0].text : '';
  const titleMatch = body.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : primaryTitle;
  const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 80);
  const firstPara = body.match(/<p[^>]*>(.*?)<\/p>/i);
  const metaDescription = firstPara ? firstPara[1].replace(/<[^>]+>/g, '').slice(0, 155).trim() : title;
  const asinsUsed = [];
  const asinRegex = /\/dp\/([A-Z0-9]{10})/g;
  let m;
  while ((m = asinRegex.exec(body)) !== null) {
    if (!asinsUsed.includes(m[1])) asinsUsed.push(m[1]);
  }
  const wordCount = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  return {
    slug, title, body, metaDescription, ogTitle: title, ogDescription: metaDescription,
    category: primaryCategory, tags: primaryTags, imageAlt: `${title} - gut health product review`,
    readingTime: Math.ceil(wordCount / 200), author: 'The Oracle Lover',
    wordCount, asinsUsed, ctaPrimary: 'See product details'
  };
}
