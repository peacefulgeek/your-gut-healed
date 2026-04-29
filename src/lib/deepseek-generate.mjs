/**
 * deepseek-generate.mjs
 * Writing engine for YourGutHealed.com
 * Uses DeepSeek V4-Pro via OpenAI-compatible client.
 * Enforces the Paul Voice Gate on every generation attempt.
 */

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});

const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';
const AMAZON_TAG = process.env.AMAZON_TAG || 'spankyspinola-20';

// ─── Verified ASIN pool (gut health niche) ────────────────────────────────────
export const ASIN_POOL = [
  'B00JEKYNZA', // Garden of Life Probiotic
  'B001FWXKTA', // Culturelle Digestive Health
  'B00CAZAU62', // Align Probiotic
  'B07CQXVXKB', // Seed DS-01 Daily Synbiotic
  'B01MFAPH3R', // Renew Life Ultimate Flora
  'B0013OXKHC', // Digestive Enzymes Ultra
  'B00YQGWBH2', // Pure Encapsulations Digestive Enzymes
  'B07BNJL6PK', // Klaire Labs Ther-Biotic
  'B00NRFPTME', // Thorne Research FloraMend
  'B00VTHJ2HO', // MegaSporeBiotic
  'B01LXNPZV3', // Jarrow Formulas Saccharomyces Boulardii
  'B00JEKYNZA', // Garden of Life RAW Probiotics
  'B07YWXRG4M', // Physician's Choice 60 Billion Probiotic
  'B08BHWJLKN', // Bio Schwartz Advanced Strength Probiotic
  'B00NRFPTME', // Thorne FloraMend Prime Probiotic
  'B07CQXVXKB', // Seed Daily Synbiotic
  'B001FWXKTA', // Culturelle Pro Strength
  'B00CAZAU62', // Align Extra Strength
  '0062684167', // The Microbiome Solution (book)
  '1250085811', // Fiber Fueled (book)
  '1250301939', // The Gut-Brain Connection (book)
  '1401952461', // The Mind-Gut Connection (book)
  '0316159212', // Brain Maker (book)
  '1629144460', // The Gut Balance Revolution (book)
  'B000GG0BNE', // Heather's Tummy Fiber
  'B00E9M4XEE', // IBgard Peppermint Oil
  'B09NXLM8ZD', // Atrantil Bloating Relief
  'B07BNJL6PK', // Klaire Labs Ther-Biotic Complete
  'B0013OXKHC', // Now Super Enzymes
  'B00YQGWBH2', // Pure Encapsulations GI Fortify
];

// ─── Paul Voice Gate ──────────────────────────────────────────────────────────
const BANNED_WORDS = [
  'utilize','delve','tapestry','landscape','paradigm','synergy','leverage',
  'unlock','empower','pivotal','embark','underscore','paramount','seamlessly',
  'robust','beacon','foster','elevate','curate','curated','bespoke','resonate',
  'harness','intricate','plethora','myriad','groundbreaking','innovative',
  'cutting-edge','state-of-the-art','game-changer','ever-evolving',
  'rapidly-evolving','stakeholders','navigate','ecosystem','framework',
  'comprehensive','transformative','holistic','nuanced','multifaceted',
  'profound','furthermore'
];

const BANNED_PHRASES = [
  "it's important to note that",
  "it's worth noting that",
  "in conclusion",
  "in summary",
  "a holistic approach",
  "in the realm of",
  "dive deep into",
  "at the end of the day",
  "in today's fast-paced world",
  "plays a crucial role"
];

function normalizeEmDashes(text) {
  return text.replace(/\u2014/g, ' - ').replace(/\u2013/g, ' - ');
}

function countWords(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
}

function countAmazonLinks(html) {
  const matches = html.match(/amazon\.com\/dp\//g);
  return matches ? matches.length : 0;
}

export function runPaulVoiceGate(html) {
  const normalized = normalizeEmDashes(html);
  const lower = normalized.toLowerCase();
  const errors = [];

  // 1. Banned words
  for (const word of BANNED_WORDS) {
    const re = new RegExp(`\\b${word}\\b`, 'i');
    if (re.test(lower)) errors.push(`Banned word: "${word}"`);
  }

  // 2. Banned phrases
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) errors.push(`Banned phrase: "${phrase}"`);
  }

  // 3. Em-dashes (after normalization — should be zero)
  if (/\u2014|\u2013/.test(normalized)) errors.push('Em-dash survived normalization');

  // 4. Word count
  const wc = countWords(normalized);
  if (wc < 1200) errors.push(`Word count too low: ${wc} (min 1200)`);
  if (wc > 2500) errors.push(`Word count too high: ${wc} (max 2500)`);

  // 5. Amazon affiliate links
  const linkCount = countAmazonLinks(normalized);
  if (linkCount < 3 || linkCount > 4) errors.push(`Amazon links: ${linkCount} (need 3 or 4)`);

  return { pass: errors.length === 0, errors, normalized };
}

// ─── Pick 3-4 ASINs for an article ───────────────────────────────────────────
function pickAsins(count = 3) {
  const shuffled = [...ASIN_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildAmazonLink(asin, label) {
  return `<a href="https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}" target="_blank" rel="nofollow sponsored">${label} (paid link)</a>`;
}

// ─── Main generation function ─────────────────────────────────────────────────
export async function generateArticle(topic, category = 'gut-health') {
  const linkCount = Math.random() < 0.5 ? 3 : 4;
  const asins = pickAsins(linkCount);

  const amazonLinksBlock = asins.map((asin, i) => {
    const labels = [
      'a top-rated probiotic', 'this gut-support supplement',
      'a highly reviewed digestive enzyme', 'this reader-favorite gut health book',
      'a trusted IBS relief product', 'this gut-healing resource'
    ];
    return buildAmazonLink(asin, labels[i % labels.length]);
  }).join('\n');

  const systemPrompt = `You are a compassionate, direct gut health writer for YourGutHealed.com. 
You write like a knowledgeable friend who has lived with IBS and gut issues personally.
You use "you" throughout. You use contractions everywhere (don't, can't, it's, you're).
You include 2-3 conversational markers like "Right?!", "Know what I mean?", "Does that land?", or "How does that make you feel?"
You write in plain, clear HTML with proper tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>.
You NEVER use em-dashes (— or –). Use a hyphen with spaces ( - ) instead.
You NEVER use these words: utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore.
You NEVER use these phrases: "it's important to note that", "it's worth noting that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role".
Article length: 1,200 to 2,500 words (strict).
You must include EXACTLY ${linkCount} Amazon affiliate links in the article body, using EXACTLY these HTML strings (do not alter them):
${amazonLinksBlock}
Place each link naturally within a paragraph where it makes sense contextually.`;

  const userPrompt = `Write a complete, publishable gut health article on this topic: "${topic}"

Category: ${category}

Requirements:
- Start with a compelling hook that speaks directly to the reader's experience
- Include at least 3 H2 sections and 2 H3 subsections
- Include a blockquote with a relevant insight or quote
- Include the ${linkCount} Amazon affiliate links provided, placed naturally in context
- End with a genuine, warm closing that doesn't say "in conclusion" or "in summary"
- Write 1,200 to 2,500 words
- Return ONLY the article HTML body (no <html>, <head>, <body> tags)
- Do NOT include a title H1 tag - that is added separately`;

  const MAX_ATTEMPTS = 4;

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

      // Strip markdown code fences if model wraps in them
      html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();

      // Normalize em-dashes before gate check
      html = normalizeEmDashes(html);

      const gate = runPaulVoiceGate(html);

      if (gate.pass) {
        console.log(`[deepseek-generate] "${topic}" passed gate on attempt ${attempt}`);
        return { ok: true, html: gate.normalized };
      } else {
        console.warn(`[deepseek-generate] Attempt ${attempt} failed gate:`, gate.errors.join('; '));
      }
    } catch (err) {
      console.error(`[deepseek-generate] Attempt ${attempt} API error:`, err.message);
    }
  }

  console.error(`[deepseek-generate] All ${MAX_ATTEMPTS} attempts failed for topic: "${topic}"`);
  return { ok: false, html: null };
}

// ─── Generate meta description ────────────────────────────────────────────────
export async function generateMeta(title, bodyHtml) {
  try {
    const excerpt = bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500);
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: `Write a compelling meta description (150-160 characters) for this gut health article.
Title: "${title}"
Excerpt: "${excerpt}"
Return ONLY the meta description text, no quotes.`
        }
      ],
      temperature: 0.5,
      max_tokens: 80
    });
    return response.choices[0]?.message?.content?.trim() || title;
  } catch {
    return title;
  }
}

// ─── Estimate reading time ────────────────────────────────────────────────────
export function estimateReadingTime(html) {
  const words = countWords(html);
  return Math.max(1, Math.round(words / 238));
}

// ─── Generate slug from title ─────────────────────────────────────────────────
export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}
