import { generateArticle } from '../src/lib/anthropic-generate.mjs';
import { runQualityGate } from '../src/lib/article-quality-gate.mjs';
import { verifyAsin } from '../src/lib/amazon-verify.mjs';
import { query, initDb, close } from '../src/lib/db.mjs';
import { uploadArticleImage } from '../src/lib/bunny.mjs';
import { generateHeroImage } from '../src/lib/fal-images.mjs';

const TOPICS = [
  { title: 'IBS Is Not "Just Stress" — But Stress Is Part of It', category: 'ibs', tags: ['ibs', 'stress', 'gut-brain'] },
  { title: 'The Gut-Brain Axis: Why Your Belly Has Its Own Nervous System', category: 'gut-brain', tags: ['gut-brain', 'nervous-system', 'vagus-nerve'] },
  { title: 'SIBO Explained: Small Intestinal Bacterial Overgrowth Without the Jargon', category: 'sibo', tags: ['sibo', 'bacteria', 'small-intestine'] },
  { title: 'The Low-FODMAP Diet: What It Is, Who It\'s For, and Why It\'s Not Forever', category: 'diet', tags: ['fodmap', 'ibs', 'diet', 'food-sensitivity'] },
  { title: 'Leaky Gut: Real Condition or Internet Myth? (The Honest Answer)', category: 'leaky-gut', tags: ['leaky-gut', 'intestinal-permeability', 'microbiome'] },
  { title: 'How Childhood Trauma Shows Up in Your Digestive System', category: 'emotional-roots', tags: ['trauma', 'emotional-roots', 'gut-brain', 'stress'] },
  { title: 'The TCM View of Digestion: Spleen Qi, Dampness, and the Middle Burner', category: 'tcm', tags: ['tcm', 'ayurveda', 'digestion', 'spleen'] },
  { title: 'Probiotics: Which Strains Actually Help IBS (And Which Make It Worse)', category: 'probiotics', tags: ['probiotics', 'ibs', 'strains', 'lactobacillus'] },
  { title: 'The Emotional Roots of Digestive Problems', category: 'emotional-roots', tags: ['emotional-roots', 'stress', 'anxiety', 'gut-brain'] },
  { title: 'Food Sensitivity Testing: What Works and What\'s a Scam', category: 'testing', tags: ['food-sensitivity', 'testing', 'igg', 'elimination-diet'] },
  { title: 'Bloating After Every Meal: A Step-by-Step Investigation', category: 'bloating', tags: ['bloating', 'gas', 'digestion', 'ibs'] },
  { title: 'The Vagus Nerve and Your Gut: Why Nervous System Work Helps Digestion', category: 'vagus-nerve', tags: ['vagus-nerve', 'nervous-system', 'gut-brain', 'parasympathetic'] },
  { title: 'Digestive Enzymes: Who Needs Them and Which Ones Work', category: 'digestive-enzymes', tags: ['digestive-enzymes', 'bloating', 'digestion', 'hcl'] },
  { title: 'The Elimination Diet: The Gold Standard Nobody Wants to Do', category: 'diet', tags: ['elimination-diet', 'food-sensitivity', 'ibs', 'diet'] },
  { title: 'Constipation as a Trauma Response (Yes, Really)', category: 'emotional-roots', tags: ['constipation', 'trauma', 'nervous-system', 'gut-brain'] },
  { title: 'Acid Reflux Without Medication: What Actually Works', category: 'acid-reflux', tags: ['acid-reflux', 'gerd', 'hcl', 'diet'] },
  { title: 'The Microbiome Reset: How to Rebuild After Antibiotics', category: 'microbiome', tags: ['microbiome', 'antibiotics', 'probiotics', 'gut-health'] },
  { title: 'Ayurvedic Digestion: Agni, Ama, and the Fire in Your Belly', category: 'ayurveda', tags: ['ayurveda', 'agni', 'digestion', 'tcm'] },
  { title: 'Why Your GI Doctor Can\'t Find Anything Wrong (And What to Do Next)', category: 'functional-medicine', tags: ['functional-medicine', 'ibs', 'testing', 'diagnosis'] },
  { title: 'Gut Health and Anxiety: The Bidirectional Highway', category: 'gut-brain', tags: ['anxiety', 'gut-brain', 'serotonin', 'nervous-system'] },
  { title: 'Herbal Medicine for IBS: Peppermint, Iberogast, and Beyond', category: 'herbal', tags: ['herbal', 'peppermint-oil', 'iberogast', 'ibs'] },
  { title: 'The Connection Between Gut Health and Skin (Acne, Eczema, Rosacea)', category: 'gut-skin', tags: ['skin', 'acne', 'eczema', 'microbiome', 'leaky-gut'] },
  { title: 'Intermittent Fasting and IBS: Help or Harm?', category: 'diet', tags: ['intermittent-fasting', 'ibs', 'diet', 'gut-health'] },
  { title: 'How to Eat When Everything Hurts: Practical Strategies', category: 'diet', tags: ['ibs', 'diet', 'food-sensitivity', 'practical'] },
  { title: 'Functional Testing Your GI Doctor Won\'t Order (And Why You Might Want It)', category: 'testing', tags: ['functional-testing', 'sibo', 'microbiome', 'stool-test'] },
  { title: 'The Candida Question: Overgrowth, Myth, and What to Actually Do', category: 'candida', tags: ['candida', 'microbiome', 'antifungal', 'diet'] },
  { title: 'Stress Eating, Restriction, and the Gut: Breaking the Cycle', category: 'emotional-roots', tags: ['stress-eating', 'restriction', 'gut-brain', 'emotional-roots'] },
  { title: 'Bone Broth, L-Glutamine, and Gut Repair: What the Science Says', category: 'gut-repair', tags: ['bone-broth', 'l-glutamine', 'gut-repair', 'leaky-gut'] },
  { title: 'Living with IBS: When It\'s Not Going Away', category: 'ibs', tags: ['ibs', 'chronic', 'management', 'quality-of-life'] },
  { title: 'Your Gut Health Morning Routine: A Practical Protocol', category: 'gut-health', tags: ['morning-routine', 'gut-health', 'practical', 'protocol'] }
];

const MAX_ATTEMPTS = 3;

await initDb();

let seeded = 0;
let failed = 0;

for (let i = 0; i < TOPICS.length; i++) {
  const topic = TOPICS[i];
  console.log(`\n[seed] ${i + 1}/${TOPICS.length}: ${topic.title}`);

  // Check if already seeded
  const existing = await query('SELECT id FROM articles WHERE title = $1', [topic.title]);
  if (existing.rows.length > 0) {
    console.log(`  [seed] Already exists — skipping`);
    seeded++;
    continue;
  }

  let ok = false;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS && !ok; attempt++) {
    try {
      console.log(`  [seed] Attempt ${attempt}...`);
      const article = await generateArticle({
        topic: topic.title,
        topicIndex: i,
        category: topic.category,
        tags: topic.tags
      });

      const gate = runQualityGate(article.body);
      if (!gate.passed) {
        console.warn(`  [seed] Quality gate FAILED: ${gate.failures.join(', ')}`);
        continue;
      }

      // Generate and upload hero image
      let imageUrl = `https://yourgut-healed.b-cdn.net/images/articles/${article.slug}.webp`;
      try {
        const imageBuffer = await generateHeroImage(topic.title, topic.category);
        imageUrl = await uploadArticleImage(imageBuffer, article.slug);
        console.log(`  [seed] Image uploaded: ${imageUrl}`);
      } catch (imgErr) {
        console.warn(`  [seed] Image generation failed (using placeholder): ${imgErr.message}`);
        imageUrl = `https://yourgut-healed.b-cdn.net/images/placeholder-gut.webp`;
      }

      // Store article
      await query(`
        INSERT INTO articles (
          slug, title, body, meta_description, og_title, og_description,
          category, tags, image_url, image_alt, reading_time, author,
          published, published_at, word_count, asins_used, cta_primary,
          opener_type, conclusion_type
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
        ON CONFLICT (slug) DO NOTHING
      `, [
        article.slug,
        article.title,
        article.body,
        article.metaDescription,
        article.ogTitle,
        article.ogDescription,
        article.category,
        article.tags,
        imageUrl,
        article.imageAlt,
        article.readingTime,
        article.author,
        true,
        new Date(Date.now() - (TOPICS.length - i) * 24 * 60 * 60 * 1000).toISOString(),
        article.wordCount,
        article.asinsUsed,
        article.ctaPrimary,
        article.openerType,
        article.conclusionType
      ]);

      console.log(`  [seed] Stored: ${article.slug} (${article.wordCount} words, ${gate.amazonLinks} Amazon links)`);
      ok = true;
      seeded++;

      // Rate limit
      if (i < TOPICS.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`  [seed] Attempt ${attempt} error:`, err.message);
    }
  }

  if (!ok) {
    console.error(`  [seed] FAILED all ${MAX_ATTEMPTS} attempts — skipping`);
    failed++;
  }
}

await close();

console.log(`\n[seed] Complete: ${seeded} seeded, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
