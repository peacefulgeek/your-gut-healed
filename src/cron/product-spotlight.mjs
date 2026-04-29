/**
 * product-spotlight.mjs
 * Saturday product spotlight generator for YourGutHealed.com.
 * Uses DeepSeek V4-Pro via OpenAI client. Inserts directly as status='published'.
 */

import OpenAI from 'openai';
import { query } from '../lib/db.mjs';
import { assignHeroImage } from '../lib/bunny.mjs';
import { runPaulVoiceGate, ASIN_POOL, slugify } from '../lib/deepseek-generate.mjs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});
const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';
const AMAZON_TAG = process.env.AMAZON_TAG || 'spankyspinola-20';

// Product spotlight topics — one ASIN as the hero, 2-3 supporting
const SPOTLIGHT_TOPICS = [
  { asin: 'B00JEKYNZA', title: 'Garden of Life RAW Probiotics', category: 'probiotics' },
  { asin: 'B001FWXKTA', title: 'Culturelle Digestive Health Probiotic', category: 'probiotics' },
  { asin: 'B07CQXVXKB', title: 'Seed DS-01 Daily Synbiotic', category: 'probiotics' },
  { asin: 'B0013OXKHC', title: 'Now Super Enzymes Digestive Blend', category: 'gut-repair' },
  { asin: 'B00E9M4XEE', title: 'IBgard Peppermint Oil Capsules for IBS', category: 'ibs' },
  { asin: 'B09NXLM8ZD', title: 'Atrantil Bloating Relief', category: 'ibs' },
  { asin: 'B000GG0BNE', title: "Heather's Tummy Fiber for IBS", category: 'ibs' },
  { asin: '1250085811', title: 'Fiber Fueled by Dr. Will Bulsiewicz', category: 'diet' },
  { asin: '1401952461', title: 'The Mind-Gut Connection by Emeran Mayer', category: 'gut-brain' },
  { asin: '0316159212', title: 'Brain Maker by Dr. David Perlmutter', category: 'microbiome' },
];

export async function generateProductSpotlight() {
  console.log('[product-spotlight] Starting Saturday spotlight run...');

  try {
    // Pick a product not recently spotlighted
    const existingRes = await query(
      `SELECT title FROM articles WHERE category = 'probiotics' OR category = 'gut-repair' ORDER BY published_at DESC LIMIT 20`,
      []
    );
    const recentTitles = new Set(existingRes.rows.map(r => r.title.toLowerCase()));

    const target = SPOTLIGHT_TOPICS.find(t => !recentTitles.has(t.title.toLowerCase()))
      || SPOTLIGHT_TOPICS[Math.floor(Math.random() * SPOTLIGHT_TOPICS.length)];

    console.log(`[product-spotlight] Target product: ${target.title} (${target.asin})`);

    // Pick 2-3 supporting ASINs
    const supportingAsins = ASIN_POOL
      .filter(a => a !== target.asin)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    const allLinks = [target.asin, ...supportingAsins].map(asin =>
      `<a href="https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}" target="_blank" rel="nofollow sponsored">${asin === target.asin ? target.title : 'a related gut health product'} (paid link)</a>`
    ).join('\n');

    const systemPrompt = `You are a compassionate, direct gut health writer for YourGutHealed.com.
You write like a knowledgeable friend who has lived with IBS and gut issues personally.
You use "you" throughout. You use contractions everywhere.
You include 2-3 conversational markers like "Right?!", "Know what I mean?", "Does that land?"
You write in plain, clear HTML: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>.
You NEVER use em-dashes (— or –). Use a hyphen with spaces ( - ) instead.
You NEVER use these words: utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore.
Article length: 1,200 to 2,500 words (strict).
Include EXACTLY ${allLinks.split('\n').length} Amazon affiliate links using these exact HTML strings:
${allLinks}`;

    const userPrompt = `Write a product spotlight article about: "${target.title}"

This is a Saturday product review for gut health readers. Structure:
- Hook: speak to the reader's frustration with gut symptoms
- What this product is and what it does
- Who it's best for
- How to use it and what to expect
- What the research says (keep it honest and grounded)
- Alternatives to consider
- Honest verdict

Include the Amazon affiliate links provided, placed naturally in context.
Write 1,200 to 2,500 words.
Return ONLY the article HTML body (no <html>, <head>, <body> tags, no H1 title).`;

    const MAX_ATTEMPTS = 4;
    let finalHtml = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await client.chat.completions.create({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.72,
          max_tokens: 4096
        });

        let html = response.choices[0]?.message?.content?.trim() || '';
        html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();
        html = html.replace(/\u2014/g, ' - ').replace(/\u2013/g, ' - ');

        const gate = runPaulVoiceGate(html);
        if (gate.pass) {
          finalHtml = gate.normalized;
          console.log(`[product-spotlight] Passed gate on attempt ${attempt}`);
          break;
        } else {
          console.warn(`[product-spotlight] Attempt ${attempt} failed:`, gate.errors.join('; '));
        }
      } catch (err) {
        console.error(`[product-spotlight] Attempt ${attempt} API error:`, err.message);
      }
    }

    if (!finalHtml) {
      console.error('[product-spotlight] All attempts failed — aborting');
      return { stored: false, reason: 'quality-gate-exhausted' };
    }

    const articleTitle = `${target.title}: An Honest Review for Gut Health`;
    const slug = slugify(articleTitle);
    const wordCount = finalHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
    const readingTime = Math.max(1, Math.round(wordCount / 238));
    const firstPara = finalHtml.match(/<p[^>]*>(.*?)<\/p>/i);
    const meta = firstPara
      ? firstPara[1].replace(/<[^>]+>/g, '').slice(0, 155).trim()
      : articleTitle;

    const imageUrl = await assignHeroImage(slug);

    await query(
      `INSERT INTO articles
        (slug, title, body, meta_description, og_title, og_description,
         category, image_url, image_alt, reading_time, word_count,
         status, queued_at, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'published',NOW(),NOW())
       ON CONFLICT (slug) DO NOTHING`,
      [
        slug, articleTitle, finalHtml, meta, articleTitle, meta,
        target.category, imageUrl, `${articleTitle} - gut health product review`,
        readingTime, wordCount
      ]
    );

    console.log(`[product-spotlight] Published: "${articleTitle}" (${wordCount} words)`);
    return { stored: true, asin: target.asin, slug, wordCount };

  } catch (err) {
    console.error('[product-spotlight] Error:', err);
    return { stored: false, reason: err.message };
  }
}
