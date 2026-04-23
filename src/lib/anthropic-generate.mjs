import Anthropic from '@anthropic-ai/sdk';
import { buildAmazonUrl } from './amazon-verify.mjs';
import { PRODUCT_CATALOG } from '../data/product-catalog.mjs';
import { matchProducts } from './match-products.mjs';
import { runQualityGate } from './article-quality-gate.mjs';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const HARD_RULES = `
HARD RULES for this article (violations = regenerate, not skip):
- 1,600 to 2,000 words (strict; under 1,200 or over 2,500 = regenerate)
- Zero em-dashes (—). Use commas, periods, colons, or parentheses instead.
- Never use these words: delve, tapestry, paradigm, synergy, leverage, unlock, empower, utilize, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, comprehensive, transformative, groundbreaking, innovative, cutting-edge, revolutionary, state-of-the-art, ever-evolving, profound, holistic, nuanced, multifaceted, stakeholders, ecosystem, furthermore, moreover, additionally, consequently, subsequently, thereby, streamline, optimize, facilitate, amplify, catalyze, navigate, traverse, realm, domain, sphere, landscape, arguably, notably, crucially, importantly, essentially, fundamentally, inherently, intrinsically
- Never use these phrases: "it's important to note," "in conclusion," "in summary," "in the realm of," "dive deep into," "at the end of the day," "in today's fast-paced world," "plays a crucial role," "a testament to," "when it comes to," "cannot be overstated," "it goes without saying," "needless to say," "first and foremost," "last but not least," "serves as a," "stands as a," "has emerged as"
- Contractions throughout: you're, don't, it's, that's, I've, can't, won't, they're
- Vary sentence length aggressively. Some fragments. Some long. Some three-word sentences.
- Direct address ("you") throughout OR first-person ("I / my") throughout. Pick one and stick with it.
- Include at least 2 conversational openers from: "Here's the thing," "Honestly," "Look," "Truth is," "But here's what's interesting," "That said," "So yeah," "You know what"
- Concrete specifics over abstractions. A name. A number. A moment.
- 3 to 4 Amazon product links embedded naturally in prose, each followed by "(paid link)" in plain text.
- No em-dashes. No em-dashes. No em-dashes.
- End with one line of italicized Sanskrit mantra (relevant to healing/gut/body).
`;

const ORACLE_LOVER_VOICE = `
VOICE: The Oracle Lover
- Short punchy sentences, 8-14 words. Staccato. Direct. First sentence hits hard.
- Tone: Practical directness. No fluff. No warming up.
- Direct address phrases: "Look," "Here's the thing," "Let me be straight with you." NEVER "my friend," NEVER "sweetheart."
- Spiritual references allowed: Jung, Angeles Arrien, Rachel Pollack, Clarissa Pinkola Estés, Joseph Campbell. NEVER Amma, NEVER Rumi, NEVER Ramana.
- Humor: Dry, practical, self-aware. "Yeah, that's not going to work. Here's what will."
- Signature energy: The no-BS oracle reader who also has a science degree. Demystifying. Grounded. Accessible.
- Use 3-5 of these phrases per article: "Look, here's the thing." / "Stop overthinking this." / "This isn't mystical. It's mechanical." / "You already know the answer. You just don't like it." / "Let me demystify this for you." / "Here's what actually works." / "Nobody's coming to explain this to you. So I will." / "The body doesn't lie. The mind does. Constantly." / "Less theory. More practice."
`;

const NICHE_RESEARCHERS = [
  'Emeran Mayer (The Mind-Gut Connection)',
  'Michael Gershon (The Second Brain)',
  'Giulia Enders (Gut: The Inside Story)',
  'Mark Pimentel (SIBO research, Cedars-Sinai)',
  'Allison Siebecker (SIBO specialist)',
  'Gabor Mate (stress-gut connection)',
  'Bessel van der Kolk (trauma stored in the body)',
  'Chris Kresser (functional gut health)',
  'Sarah Ballantyne (The Paleo Approach)',
  'Nirala Jacobi (SIBO naturopath)'
];

const SPIRITUAL_RESEARCHERS = [
  'Carl Jung',
  'Angeles Arrien',
  'Rachel Pollack',
  'Clarissa Pinkola Estes',
  'Joseph Campbell'
];

const OPENER_TYPES = ['gut-punch', 'question', 'micro-story', 'counterintuitive'];
const CONCLUSION_TYPES = ['cta', 'reflection', 'question', 'challenge', 'benediction'];

function pickOpenerType(index) {
  return OPENER_TYPES[index % OPENER_TYPES.length];
}

function pickConclusionType(index) {
  return CONCLUSION_TYPES[index % CONCLUSION_TYPES.length];
}

function pickResearchers(index) {
  // 70% niche, 30% spiritual
  const useSpiritual = (index % 10) < 3;
  const pool = useSpiritual
    ? [...NICHE_RESEARCHERS.slice(0, 6), SPIRITUAL_RESEARCHERS[index % SPIRITUAL_RESEARCHERS.length]]
    : NICHE_RESEARCHERS;
  return pool.slice(0, 3).join(', ');
}

function buildProductLinks(topic, category, tags) {
  const products = matchProducts({
    articleTitle: topic,
    articleTags: tags,
    articleCategory: category,
    catalog: PRODUCT_CATALOG,
    minLinks: 3,
    maxLinks: 4
  });

  return products.map(p =>
    `- ${p.name}: ${buildAmazonUrl(p.asin)} (paid link) [ASIN: ${p.asin}]`
  ).join('\n');
}

function getOpenerInstruction(openerType) {
  const instructions = {
    'gut-punch': 'Start with a bold, direct gut-punch statement that challenges a common assumption about digestive health. No warm-up. Hit hard in the first sentence.',
    'question': 'Start with a provocative question that makes the reader stop and think about their own gut situation.',
    'micro-story': 'Start with a 2-3 sentence micro-story about a real scenario (a patient, a moment, a specific situation) that illustrates the article topic.',
    'counterintuitive': 'Start with a counterintuitive claim that goes against conventional wisdom about gut health or digestion.'
  };
  return instructions[openerType] || instructions['gut-punch'];
}

function getConclusionInstruction(conclusionType) {
  const instructions = {
    'cta': 'End with a clear, practical call to action - one specific thing the reader can do today.',
    'reflection': 'End with a reflective observation that invites the reader to sit with a new perspective.',
    'question': 'End with an open question that sends the reader away thinking.',
    'challenge': 'End with a direct challenge to the reader to try something specific.',
    'benediction': 'End with a warm, grounding benediction-style closing that acknowledges the difficulty of the work.'
  };
  return instructions[conclusionType] || instructions['reflection'];
}

export async function generateArticle({ topic, topicIndex = 0, category = 'gut-health', tags = [] }) {
  const openerType = pickOpenerType(topicIndex);
  const conclusionType = pickConclusionType(topicIndex);
  const researchers = pickResearchers(topicIndex);
  const productLinks = buildProductLinks(topic, category, tags);
  const faqCount = [0, 0, 2, 3, 5][topicIndex % 5];
  const includeBacklink = (topicIndex % 4) === 0; // ~25% get theoraclelover.com backlink

  const prompt = `You are The Oracle Lover, writing for YourGutHealed.com - a site about IBS, digestive distress, gut-brain connection, SIBO, leaky gut, microbiome healing, food sensitivities, and the emotional roots of digestive problems.

${ORACLE_LOVER_VOICE}

Write a complete article on this topic: "${topic}"

${HARD_RULES}

STRUCTURE:
1. H1 title (compelling, specific, not clickbait)
2. ${getOpenerInstruction(openerType)}
3. 3-5 H2 sections with H3 subsections where natural
4. ${faqCount > 0 ? `FAQ section with exactly ${faqCount} questions and answers` : 'No FAQ section for this article'}
5. ${getConclusionInstruction(conclusionType)}
6. Final line: one italicized Sanskrit mantra relevant to healing or the body (format: *mantra text* - brief translation)
7. Author bio at the very bottom: "The Oracle Lover is an intuitive educator and oracle guide. Read more at [theoraclelover.com](https://theoraclelover.com)."

PRODUCT LINKS TO EMBED (embed 3-4 naturally in the prose, NOT as a list):
${productLinks}

Embed each product link naturally within a sentence, like:
- "One option that many people find helpful is [Product Name](URL) (paid link)."
- "A tool worth considering is [Product Name](URL) (paid link)."
- "For those looking for a simple solution, [Product Name](URL) (paid link) works well."

${includeBacklink ? 'BACKLINK: Include one natural mention of theoraclelover.com in the article body (not just the bio). Anchor text should be varied and natural, not "click here".' : ''}

RESEARCHERS TO CITE (cite 2-3 of these where relevant): ${researchers}

HEALTH DISCLAIMER: Include this at the end before the author bio:
"This article is for educational purposes only and is not intended as medical advice. Digestive symptoms can indicate serious conditions. Always consult your healthcare provider before starting any new supplement or dietary protocol."

AMAZON DISCLOSURE: Include this line after the product links:
"As an Amazon Associate, I earn from qualifying purchases."

OUTPUT FORMAT: Return the article as clean HTML with proper h1, h2, h3, p, ul, ol, em, strong tags. No markdown. No code blocks. Just the HTML content starting with <h1> and ending with the author bio paragraph.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  const body = message.content[0].type === 'text' ? message.content[0].text : '';

  // Extract title from H1
  const titleMatch = body.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : topic;

  // Generate slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

  // Generate meta description
  const firstPara = body.match(/<p[^>]*>(.*?)<\/p>/i);
  const metaDescription = firstPara
    ? firstPara[1].replace(/<[^>]+>/g, '').slice(0, 155).trim()
    : `${topic} - practical insights from The Oracle Lover`;

  // Extract ASINs used
  const asinsUsed = [];
  const asinRegex = /\/dp\/([A-Z0-9]{10})/g;
  let m;
  while ((m = asinRegex.exec(body)) !== null) {
    if (!asinsUsed.includes(m[1])) asinsUsed.push(m[1]);
  }

  const wordCount = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  return {
    slug,
    title,
    body,
    metaDescription,
    ogTitle: title,
    ogDescription: metaDescription,
    category,
    tags,
    imageAlt: `${topic} - gut health illustration`,
    readingTime,
    author: 'The Oracle Lover',
    wordCount,
    asinsUsed,
    openerType,
    conclusionType,
    ctaPrimary: 'Read more gut health insights'
  };
}

export async function generateMonthlyRefresh(article) {
  const prompt = `You are The Oracle Lover. Refresh this gut health article. Keep the voice and structure. Refresh specifics (numbers, names, dates) so they feel current. Re-apply ALL HARD RULES.

${HARD_RULES}
${ORACLE_LOVER_VOICE}

Original article title: ${article.title}
Original body:
${article.body}

Return the refreshed article as clean HTML, same structure, same product links (keep the same ASINs), updated prose.`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].type === 'text' ? message.content[0].text : article.body;
}

export async function generateQuarterlyRefresh(article) {
  const prompt = `You are The Oracle Lover. Substantially rewrite this gut health article. New hook, new examples, refreshed product recommendations. Same niche, same voice, same HARD RULES.

${HARD_RULES}
${ORACLE_LOVER_VOICE}

Original article title: ${article.title}
Original body:
${article.body}

Return the rewritten article as clean HTML starting with <h1>.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].type === 'text' ? message.content[0].text : article.body;
}
