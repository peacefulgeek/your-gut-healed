#!/usr/bin/env node
/**
 * bulk-seed.mjs
 * Generates 500 queued articles for YourGutHealed.com using DeepSeek V4-Pro.
 * All articles are inserted with status='queued' — the cron releases them on schedule.
 *
 * Usage:
 *   node scripts/bulk-seed.mjs
 *   pnpm bulk-seed
 *
 * Requires: DATABASE_URL, OPENAI_API_KEY env vars.
 */

import { query, initDb, close } from '../src/lib/db.mjs';
import { generateArticle, generateMeta, estimateReadingTime, slugify } from '../src/lib/deepseek-generate.mjs';
import { assignHeroImage } from '../src/lib/bunny.mjs';

// ─── 500 unique gut health topics ────────────────────────────────────────────
const TOPICS = [
  // IBS & Symptoms
  { title: "Why Your IBS Symptoms Are Worse in the Morning", category: "ibs" },
  { title: "IBS and Bloating: What's Actually Happening in Your Gut", category: "ibs" },
  { title: "The Difference Between IBS-C, IBS-D, and IBS-M", category: "ibs" },
  { title: "Why IBS Flares Happen Even When You Eat 'Safe' Foods", category: "ibs" },
  { title: "IBS and Urgency: How to Stop Living in Fear of the Bathroom", category: "ibs" },
  { title: "What Your IBS Pain Is Actually Telling You", category: "ibs" },
  { title: "IBS and Fatigue: The Gut-Energy Connection Nobody Talks About", category: "ibs" },
  { title: "How IBS Changes Over Time and What to Do About It", category: "ibs" },
  { title: "IBS After a Stomach Bug: Post-Infectious IBS Explained", category: "ibs" },
  { title: "Why Women Get IBS More Than Men", category: "ibs" },
  { title: "IBS and Nausea: Why Your Stomach Feels Sick All the Time", category: "ibs" },
  { title: "The Link Between IBS and Incomplete Evacuation", category: "ibs" },
  { title: "IBS and Back Pain: The Hidden Connection", category: "ibs" },
  { title: "Why Your IBS Gets Worse Before Your Period", category: "ibs" },
  { title: "IBS and Mucus in Stool: What It Means and What to Do", category: "ibs" },
  { title: "How to Tell If You Have IBS or Something More Serious", category: "ibs" },
  { title: "IBS and Insomnia: Why Your Gut Keeps You Up at Night", category: "ibs" },
  { title: "The Role of Visceral Hypersensitivity in IBS Pain", category: "ibs" },
  { title: "IBS and Headaches: Are They Connected?", category: "ibs" },
  { title: "Why Your IBS Is Worse When You Travel", category: "ibs" },

  // Gut-Brain Axis
  { title: "The Gut-Brain Axis: A Plain-English Explanation", category: "gut-brain" },
  { title: "How Your Gut Produces 95% of Your Serotonin", category: "gut-brain" },
  { title: "Anxiety and IBS: Which Comes First?", category: "gut-brain" },
  { title: "How Chronic Stress Physically Damages Your Gut Lining", category: "gut-brain" },
  { title: "The Vagus Nerve: Your Gut's Direct Line to Your Brain", category: "gut-brain" },
  { title: "How Depression Changes Your Gut Microbiome", category: "gut-brain" },
  { title: "The Enteric Nervous System: Your Second Brain", category: "gut-brain" },
  { title: "How Gut Bacteria Make Neurotransmitters", category: "gut-brain" },
  { title: "Why Therapy Can Heal Your Gut (Not Just Your Mind)", category: "gut-brain" },
  { title: "Gut-Brain Communication: How Signals Travel Both Ways", category: "gut-brain" },
  { title: "How PTSD Affects Your Digestive System", category: "gut-brain" },
  { title: "The Connection Between Childhood Stress and Adult IBS", category: "gut-brain" },
  { title: "How Mindfulness Changes Your Gut Biology", category: "gut-brain" },
  { title: "Panic Attacks and Your Gut: What's Really Happening", category: "gut-brain" },
  { title: "How Loneliness Affects Your Microbiome", category: "gut-brain" },
  { title: "The Role of Cortisol in Gut Inflammation", category: "gut-brain" },
  { title: "How Your Gut Influences Your Mood Every Single Day", category: "gut-brain" },
  { title: "Brain Fog and Gut Health: The Missing Link", category: "gut-brain" },
  { title: "How Breathing Exercises Calm Your Gut", category: "gut-brain" },
  { title: "The Gut-Brain Connection in Children with Digestive Issues", category: "gut-brain" },

  // Microbiome
  { title: "What Is the Gut Microbiome and Why Does It Matter?", category: "microbiome" },
  { title: "How Antibiotics Destroy Your Microbiome (and How to Rebuild)", category: "microbiome" },
  { title: "The Difference Between Probiotics and Prebiotics", category: "microbiome" },
  { title: "Which Foods Feed Your Good Gut Bacteria", category: "microbiome" },
  { title: "How Your Microbiome Changes After 40", category: "microbiome" },
  { title: "The Microbiome-Immune System Connection", category: "microbiome" },
  { title: "How Diversity in Your Microbiome Protects Your Health", category: "microbiome" },
  { title: "Microbiome Testing: Is It Worth It?", category: "microbiome" },
  { title: "How C-Section Birth Affects Your Microbiome for Life", category: "microbiome" },
  { title: "The Role of Fiber in Feeding Your Microbiome", category: "microbiome" },
  { title: "How Fermented Foods Change Your Gut Bacteria", category: "microbiome" },
  { title: "The Microbiome and Autoimmune Disease", category: "microbiome" },
  { title: "How Stress Kills Your Good Gut Bacteria", category: "microbiome" },
  { title: "Akkermansia: The Gut Bacterium Everyone's Talking About", category: "microbiome" },
  { title: "How Your Microbiome Affects Your Weight", category: "microbiome" },
  { title: "The Microbiome and Skin Health: The Gut-Skin Axis", category: "microbiome" },
  { title: "How Sleep Deprivation Damages Your Microbiome", category: "microbiome" },
  { title: "Bifidobacterium vs Lactobacillus: What's the Difference?", category: "microbiome" },
  { title: "How Exercise Changes Your Gut Bacteria", category: "microbiome" },
  { title: "The Microbiome and Mental Health: New Research", category: "microbiome" },

  // SIBO
  { title: "SIBO: What It Is and Why It's So Hard to Diagnose", category: "sibo" },
  { title: "The Three Types of SIBO and How They Differ", category: "sibo" },
  { title: "SIBO vs IBS: How to Tell the Difference", category: "sibo" },
  { title: "The SIBO Breath Test: What It Measures and What It Misses", category: "sibo" },
  { title: "Why SIBO Keeps Coming Back After Treatment", category: "sibo" },
  { title: "The Low-FODMAP Diet for SIBO: Does It Actually Help?", category: "sibo" },
  { title: "Herbal Antibiotics for SIBO: What the Research Says", category: "sibo" },
  { title: "SIBO and Rifaximin: What to Expect from Treatment", category: "sibo" },
  { title: "How the Migrating Motor Complex Prevents SIBO", category: "sibo" },
  { title: "SIBO and Rosacea: The Surprising Skin Connection", category: "sibo" },
  { title: "SIBO After Food Poisoning: Why It Happens", category: "sibo" },
  { title: "The Elemental Diet for SIBO: A Complete Guide", category: "sibo" },
  { title: "SIBO and Hypothyroidism: The Gut-Thyroid Connection", category: "sibo" },
  { title: "Why Low Stomach Acid Causes SIBO", category: "sibo" },
  { title: "SIBO and Bloating: Why You Look Pregnant After Eating", category: "sibo" },
  { title: "Prokinetics for SIBO: What They Are and How They Help", category: "sibo" },
  { title: "SIBO and Nutrient Deficiencies: What Gets Depleted", category: "sibo" },
  { title: "Methane SIBO vs Hydrogen SIBO: Different Symptoms, Different Treatment", category: "sibo" },
  { title: "SIBO and Leaky Gut: How They Feed Each Other", category: "sibo" },
  { title: "Life After SIBO Treatment: Rebuilding Your Gut", category: "sibo" },

  // Diet & Food
  { title: "The Low-FODMAP Diet: A Beginner's Complete Guide", category: "diet" },
  { title: "Why Gluten Bothers You Even If You Don't Have Celiac", category: "diet" },
  { title: "The Best Foods for IBS (That Actually Work)", category: "diet" },
  { title: "Foods That Secretly Trigger IBS Flares", category: "diet" },
  { title: "How to Eat When Everything Seems to Hurt Your Gut", category: "diet" },
  { title: "The Specific Carbohydrate Diet for IBD and IBS", category: "diet" },
  { title: "Intermittent Fasting and Your Gut: What You Need to Know", category: "diet" },
  { title: "How to Reintroduce Foods After an Elimination Diet", category: "diet" },
  { title: "The Gut-Healing Power of Bone Broth", category: "diet" },
  { title: "Resistant Starch: The Carb That Feeds Your Good Bacteria", category: "diet" },
  { title: "How Eating Too Fast Destroys Your Digestion", category: "diet" },
  { title: "The Best Probiotic Foods (Beyond Yogurt)", category: "diet" },
  { title: "Why Coffee Wrecks Some Guts and Not Others", category: "diet" },
  { title: "Alcohol and Your Gut: The Honest Truth", category: "diet" },
  { title: "How to Eat for Gut Health on a Budget", category: "diet" },
  { title: "The Anti-Inflammatory Diet for Gut Healing", category: "diet" },
  { title: "Histamine Intolerance: Is Your Gut Reacting to Histamine?", category: "diet" },
  { title: "Oxalates and Gut Health: What You Need to Know", category: "diet" },
  { title: "How Meal Timing Affects Your Gut Microbiome", category: "diet" },
  { title: "The Gut-Healing Benefits of Collagen", category: "diet" },

  // Emotional Roots
  { title: "The Emotional Roots of IBS: What the Research Shows", category: "emotional-roots" },
  { title: "How Childhood Trauma Lives in Your Gut", category: "emotional-roots" },
  { title: "The Gut as a Trauma Holder: A Somatic Perspective", category: "emotional-roots" },
  { title: "Why Grief Hits You in the Stomach", category: "emotional-roots" },
  { title: "How Perfectionism Triggers IBS Flares", category: "emotional-roots" },
  { title: "The Connection Between People-Pleasing and Gut Problems", category: "emotional-roots" },
  { title: "How Unprocessed Anger Affects Your Digestion", category: "emotional-roots" },
  { title: "Shame and the Gut: Why Embarrassment Causes Physical Symptoms", category: "emotional-roots" },
  { title: "How Boundaries (or Lack of Them) Show Up in Your Gut", category: "emotional-roots" },
  { title: "The Gut and Grief: Processing Loss Through Your Body", category: "emotional-roots" },
  { title: "Why Your Gut Flares During Conflict", category: "emotional-roots" },
  { title: "How Fear of Abandonment Affects Your Digestive System", category: "emotional-roots" },
  { title: "The Body Keeps the Score: What It Means for Gut Health", category: "emotional-roots" },
  { title: "How Nervous System Dysregulation Causes Gut Symptoms", category: "emotional-roots" },
  { title: "Somatic Therapy for IBS: Does It Work?", category: "emotional-roots" },
  { title: "How Self-Compassion Heals Your Gut", category: "emotional-roots" },
  { title: "The Gut Symptoms Nobody Tells You Are Emotional", category: "emotional-roots" },
  { title: "How Hypervigilance Keeps Your Gut in Fight-or-Flight", category: "emotional-roots" },
  { title: "Emotional Eating vs Gut Reactions: How to Tell the Difference", category: "emotional-roots" },
  { title: "Why Healing Your Gut Requires Healing Your Story", category: "emotional-roots" },

  // Gut Repair
  { title: "Leaky Gut Syndrome: What It Is and How to Fix It", category: "gut-repair" },
  { title: "The 4R Protocol for Gut Healing: Remove, Replace, Reinoculate, Repair", category: "gut-repair" },
  { title: "L-Glutamine for Gut Healing: Does It Work?", category: "gut-repair" },
  { title: "How Long Does It Take to Heal a Leaky Gut?", category: "gut-repair" },
  { title: "Zinc Carnosine for Gut Lining Repair", category: "gut-repair" },
  { title: "The Best Supplements for Gut Healing (Evidence-Based)", category: "gut-repair" },
  { title: "How to Repair Your Gut After Years of Antibiotics", category: "gut-repair" },
  { title: "Digestive Enzymes: When You Need Them and When You Don't", category: "gut-repair" },
  { title: "How to Heal Your Gut After a Parasite Infection", category: "gut-repair" },
  { title: "Butyrate: The Short-Chain Fatty Acid That Heals Your Colon", category: "gut-repair" },
  { title: "How to Support Your Gut Lining with Food", category: "gut-repair" },
  { title: "Slippery Elm for Gut Healing: What the Research Says", category: "gut-repair" },
  { title: "How to Reduce Gut Inflammation Naturally", category: "gut-repair" },
  { title: "The Role of Stomach Acid in Gut Health", category: "gut-repair" },
  { title: "Deglycyrrhizinated Licorice (DGL) for Gut Healing", category: "gut-repair" },
  { title: "How to Heal Your Gut After Chemotherapy", category: "gut-repair" },
  { title: "Marshmallow Root for Gut Health: A Complete Guide", category: "gut-repair" },
  { title: "How to Know If Your Gut Lining Is Damaged", category: "gut-repair" },
  { title: "The Morning Routine That Supports Gut Healing", category: "gut-repair" },
  { title: "How Colostrum Heals the Gut Lining", category: "gut-repair" },

  // Probiotics
  { title: "How to Choose the Right Probiotic for IBS", category: "probiotics" },
  { title: "The Best Probiotic Strains for Bloating", category: "probiotics" },
  { title: "Lactobacillus rhamnosus GG: The Most Researched Probiotic", category: "probiotics" },
  { title: "Should You Take Probiotics During or After Antibiotics?", category: "probiotics" },
  { title: "Spore-Based Probiotics: Are They Better Than Regular Ones?", category: "probiotics" },
  { title: "Saccharomyces Boulardii: The Yeast That Fights Bad Bacteria", category: "probiotics" },
  { title: "Why Some Probiotics Make IBS Worse", category: "probiotics" },
  { title: "Soil-Based Organisms: The Probiotic Controversy", category: "probiotics" },
  { title: "How Long Does It Take for Probiotics to Work?", category: "probiotics" },
  { title: "Probiotics for Constipation: What Actually Works", category: "probiotics" },
  { title: "The Best Probiotic Foods vs Supplements: Which Is Better?", category: "probiotics" },
  { title: "Probiotics for Anxiety: The Gut-Brain Evidence", category: "probiotics" },
  { title: "How to Store Probiotics Properly (Most People Get This Wrong)", category: "probiotics" },
  { title: "Probiotics for Children with Gut Issues", category: "probiotics" },
  { title: "The Difference Between Prebiotics, Probiotics, and Postbiotics", category: "probiotics" },
  { title: "Bifidobacterium Longum: The Probiotic for Stress and Anxiety", category: "probiotics" },
  { title: "Why Your Probiotic Might Not Be Working", category: "probiotics" },
  { title: "Probiotics for Acid Reflux: Does the Evidence Support It?", category: "probiotics" },
  { title: "How Probiotics Interact with Medications", category: "probiotics" },
  { title: "The Psychobiotic Revolution: Probiotics for Mental Health", category: "probiotics" },

  // Herbal & Natural
  { title: "Peppermint Oil for IBS: The Evidence Is Stronger Than You Think", category: "herbal" },
  { title: "Iberogast for IBS: A Natural Prokinetic That Works", category: "herbal" },
  { title: "Ginger for Digestion: How to Use It and How Much", category: "herbal" },
  { title: "Berberine for Gut Health: The Antibiotic Alternative", category: "herbal" },
  { title: "Oregano Oil for Gut Infections: What You Need to Know", category: "herbal" },
  { title: "Aloe Vera for IBS: Does It Actually Help?", category: "herbal" },
  { title: "Licorice Root for Gut Healing: Benefits and Cautions", category: "herbal" },
  { title: "Artichoke Leaf Extract for Bloating and Digestion", category: "herbal" },
  { title: "Turmeric and Curcumin for Gut Inflammation", category: "herbal" },
  { title: "Fennel for Bloating and Gas: How to Use It", category: "herbal" },
  { title: "Chamomile for IBS: The Calming Herb That Works Two Ways", category: "herbal" },
  { title: "Wormwood for SIBO: The Herbal Protocol Explained", category: "herbal" },
  { title: "Neem for Gut Health: Anti-Parasitic and Anti-Bacterial", category: "herbal" },
  { title: "Triphala: The Ayurvedic Gut Tonic That Actually Has Research", category: "herbal" },
  { title: "Digestive Bitters: Why Your Gut Needs Bitter Foods", category: "herbal" },
  { title: "Slippery Elm vs Marshmallow Root: Which Is Better for Your Gut?", category: "herbal" },
  { title: "Activated Charcoal for Gas and Bloating: Helpful or Harmful?", category: "herbal" },
  { title: "Glutamine Powder vs Capsules for Gut Healing", category: "herbal" },
  { title: "Mastic Gum for H. Pylori and Gut Infections", category: "herbal" },
  { title: "The Best Herbal Teas for Gut Health", category: "herbal" },

  // Vagus Nerve
  { title: "The Vagus Nerve and Digestion: Everything You Need to Know", category: "vagus-nerve" },
  { title: "How to Stimulate Your Vagus Nerve to Calm Your Gut", category: "vagus-nerve" },
  { title: "Vagal Tone: What It Is and Why It Matters for IBS", category: "vagus-nerve" },
  { title: "Cold Water and the Vagus Nerve: Does It Really Work?", category: "vagus-nerve" },
  { title: "Humming, Singing, and Gargling for Vagus Nerve Activation", category: "vagus-nerve" },
  { title: "How Yoga Activates the Vagus Nerve", category: "vagus-nerve" },
  { title: "The Polyvagal Theory and Gut Health", category: "vagus-nerve" },
  { title: "How Slow Breathing Activates Your Vagus Nerve", category: "vagus-nerve" },
  { title: "Vagus Nerve Stimulation Devices: Are They Worth It?", category: "vagus-nerve" },
  { title: "How Trauma Damages Vagal Tone and What to Do About It", category: "vagus-nerve" },
  { title: "The Vagus Nerve and Inflammation: The Anti-Inflammatory Reflex", category: "vagus-nerve" },
  { title: "How to Test Your Vagal Tone at Home", category: "vagus-nerve" },
  { title: "The Vagus Nerve and Heart Rate Variability", category: "vagus-nerve" },
  { title: "How Massage Activates the Vagus Nerve", category: "vagus-nerve" },
  { title: "Vagus Nerve Exercises You Can Do Right Now", category: "vagus-nerve" },
  { title: "How Social Connection Strengthens Your Vagus Nerve", category: "vagus-nerve" },
  { title: "The Vagus Nerve and Nausea: Why Stimulation Helps", category: "vagus-nerve" },
  { title: "How Fasting Affects Vagal Tone", category: "vagus-nerve" },
  { title: "The Vagus Nerve in Children: Why It Matters for Gut Health", category: "vagus-nerve" },
  { title: "Acupuncture and the Vagus Nerve: What the Research Shows", category: "vagus-nerve" },

  // Functional Testing
  { title: "The GI-MAP Stool Test: What It Measures and Who Needs It", category: "gut-repair" },
  { title: "Comprehensive Stool Analysis: Is It Worth the Cost?", category: "gut-repair" },
  { title: "Organic Acids Testing for Gut Health", category: "gut-repair" },
  { title: "Food Sensitivity Testing: IgG vs IgE and What They Mean", category: "gut-repair" },
  { title: "The SIBO Breath Test: Hydrogen vs Methane vs Hydrogen Sulfide", category: "sibo" },
  { title: "Zonulin Testing for Leaky Gut: What It Can and Can't Tell You", category: "gut-repair" },
  { title: "Calprotectin Testing: Distinguishing IBS from IBD", category: "ibs" },
  { title: "When to See a Gastroenterologist (and What to Ask)", category: "gut-repair" },
  { title: "Colonoscopy vs Stool Testing: What's Right for You?", category: "gut-repair" },
  { title: "How to Prepare for a GI Appointment (So You Don't Leave Empty-Handed)", category: "gut-repair" },

  // Specific Conditions
  { title: "Acid Reflux and GERD: The Gut Microbiome Connection", category: "gut-repair" },
  { title: "H. Pylori: The Stomach Bacteria That Causes More Than Ulcers", category: "gut-repair" },
  { title: "Candida Overgrowth: Real Condition or Wellness Myth?", category: "microbiome" },
  { title: "Crohn's Disease vs IBS: The Key Differences", category: "ibs" },
  { title: "Ulcerative Colitis: Gut Healing Strategies Beyond Medication", category: "gut-repair" },
  { title: "Celiac Disease vs Non-Celiac Gluten Sensitivity", category: "diet" },
  { title: "Gastroparesis: When Your Stomach Empties Too Slowly", category: "gut-repair" },
  { title: "Diverticulitis: Prevention and Gut Healing After a Flare", category: "gut-repair" },
  { title: "Eosinophilic Esophagitis: The Gut-Immune Connection", category: "gut-repair" },
  { title: "Bile Acid Malabsorption: The IBS Diagnosis Nobody Gives You", category: "ibs" },
  { title: "Pelvic Floor Dysfunction and Constipation: The Missing Piece", category: "ibs" },
  { title: "Endometriosis and IBS: Why They So Often Coexist", category: "ibs" },
  { title: "Mast Cell Activation Syndrome and Your Gut", category: "gut-repair" },
  { title: "Ehlers-Danlos Syndrome and Gut Motility Problems", category: "gut-repair" },
  { title: "POTS and Gut Health: The Autonomic Connection", category: "gut-brain" },

  // Lifestyle & Habits
  { title: "The Best Sleep Positions for Digestive Health", category: "gut-repair" },
  { title: "How Walking After Meals Improves Digestion", category: "diet" },
  { title: "Why You Should Never Eat at Your Desk", category: "diet" },
  { title: "The Gut-Healing Power of Eating Slowly", category: "diet" },
  { title: "How Hydration Affects Your Gut Motility", category: "diet" },
  { title: "Stress Management Techniques That Actually Help IBS", category: "gut-brain" },
  { title: "How to Build a Gut-Healing Morning Routine", category: "gut-repair" },
  { title: "The Best Exercise for IBS (and What to Avoid)", category: "gut-repair" },
  { title: "How Sitting All Day Destroys Your Gut Health", category: "gut-repair" },
  { title: "The Gut-Healing Benefits of Time in Nature", category: "gut-brain" },
  { title: "How to Travel with IBS Without Ruining Your Trip", category: "ibs" },
  { title: "Eating Out with IBS: A Practical Guide", category: "ibs" },
  { title: "How to Talk to Your Doctor About IBS (Without Being Dismissed)", category: "ibs" },
  { title: "The Gut-Healing Benefits of Laughter", category: "gut-brain" },
  { title: "How to Create a Gut-Friendly Home Environment", category: "gut-repair" },

  // TCM & Alternative
  { title: "Traditional Chinese Medicine for IBS: What Works", category: "herbal" },
  { title: "Acupuncture for IBS: The Evidence in 2024", category: "herbal" },
  { title: "Ayurveda and Gut Health: The Dosha-Digestion Connection", category: "herbal" },
  { title: "Hypnotherapy for IBS: The Most Underused Treatment", category: "gut-brain" },
  { title: "Cognitive Behavioral Therapy for IBS: How It Works", category: "gut-brain" },
  { title: "Gut-Directed Hypnotherapy: What to Expect", category: "gut-brain" },
  { title: "The Low-FODMAP Diet in Ayurvedic Context", category: "diet" },
  { title: "Reflexology for Digestive Health: What the Research Says", category: "herbal" },
  { title: "Castor Oil Packs for Gut Healing: Ancient Remedy or Placebo?", category: "herbal" },
  { title: "Abdominal Massage for IBS and Constipation", category: "gut-repair" },

  // Pediatric & Family
  { title: "IBS in Children: Signs, Causes, and What to Do", category: "ibs" },
  { title: "How to Support a Child with Gut Pain", category: "gut-brain" },
  { title: "Gut Health During Pregnancy: What Changes and Why", category: "microbiome" },
  { title: "How to Rebuild Your Baby's Microbiome After Antibiotics", category: "microbiome" },
  { title: "Colic and Gut Health: What's Really Going On", category: "microbiome" },
  { title: "How to Introduce Solid Foods for Optimal Gut Health", category: "diet" },
  { title: "Gut Health in Teenagers: The Stress-Microbiome Connection", category: "gut-brain" },
  { title: "How Breastfeeding Shapes the Infant Microbiome", category: "microbiome" },
  { title: "Gut Health After Menopause: What Changes and Why", category: "microbiome" },
  { title: "How Aging Changes Your Gut and What to Do About It", category: "microbiome" },

  // Advanced Topics
  { title: "Fecal Microbiota Transplant: The Future of Gut Treatment?", category: "microbiome" },
  { title: "Postbiotics: The Next Frontier in Gut Health", category: "microbiome" },
  { title: "The Oral Microbiome and Its Connection to Gut Health", category: "microbiome" },
  { title: "The Lung-Gut Axis: How Your Lungs and Gut Talk to Each Other", category: "microbiome" },
  { title: "The Liver-Gut Axis: Why Your Liver Depends on Your Gut", category: "gut-repair" },
  { title: "Mitochondria and Gut Health: The Energy Connection", category: "gut-repair" },
  { title: "How Circadian Rhythm Affects Your Gut Microbiome", category: "microbiome" },
  { title: "The Gut-Kidney Axis: Protecting Both Organs at Once", category: "gut-repair" },
  { title: "Epigenetics and Gut Health: Can You Change Your Gut DNA?", category: "microbiome" },
  { title: "The Gut and Cardiovascular Disease: A Surprising Connection", category: "microbiome" },

  // Mental Health & Gut
  { title: "OCD and Gut Health: The Serotonin Connection", category: "gut-brain" },
  { title: "ADHD and the Gut Microbiome: Emerging Research", category: "gut-brain" },
  { title: "Autism and Gut Health: What Parents Need to Know", category: "gut-brain" },
  { title: "Eating Disorders and Gut Health: The Bidirectional Relationship", category: "gut-brain" },
  { title: "How Bipolar Disorder Affects the Gut Microbiome", category: "gut-brain" },
  { title: "Schizophrenia and the Gut: New Research on the Microbiome", category: "gut-brain" },
  { title: "Seasonal Affective Disorder and Your Gut Bacteria", category: "gut-brain" },
  { title: "How Antidepressants Affect Your Gut Microbiome", category: "gut-brain" },
  { title: "Gut Health After Trauma: A Somatic Healing Guide", category: "emotional-roots" },
  { title: "How Chronic Pain Rewires Your Gut-Brain Axis", category: "gut-brain" },

  // Specific Symptoms
  { title: "Why You're Always Bloated (Even When You Eat Clean)", category: "ibs" },
  { title: "Chronic Constipation: Root Causes Beyond Diet", category: "ibs" },
  { title: "Chronic Diarrhea: When It's Not Just What You Ate", category: "ibs" },
  { title: "Gas and Flatulence: What's Normal and What's Not", category: "ibs" },
  { title: "Stomach Gurgling: What Those Noises Actually Mean", category: "ibs" },
  { title: "Why You Feel Full After Just a Few Bites", category: "ibs" },
  { title: "Rectal Pain and IBS: What's Causing It", category: "ibs" },
  { title: "Abdominal Cramping: How to Distinguish Causes", category: "ibs" },
  { title: "Why Your Stomach Hurts After Every Meal", category: "ibs" },
  { title: "The Difference Between Bloating and Distension", category: "ibs" },

  // Healing Stories & Mindset
  { title: "What Healing Your Gut Actually Looks Like (It's Not Linear)", category: "emotional-roots" },
  { title: "How to Stop Obsessing Over Every Gut Symptom", category: "emotional-roots" },
  { title: "When Gut Healing Feels Impossible: A Realistic Pep Talk", category: "emotional-roots" },
  { title: "How to Rebuild Trust with Your Body After Years of Gut Problems", category: "emotional-roots" },
  { title: "The Grief of Losing Your 'Normal' Gut Health", category: "emotional-roots" },
  { title: "How to Explain Your Gut Issues to People Who Don't Get It", category: "ibs" },
  { title: "Why Healing Your Gut Is an Act of Self-Love", category: "emotional-roots" },
  { title: "How to Stay Hopeful When Your Gut Keeps Flaring", category: "emotional-roots" },
  { title: "The Identity Shift That Comes with Chronic Gut Issues", category: "emotional-roots" },
  { title: "What I Wish I'd Known at the Start of My Gut Healing Journey", category: "emotional-roots" },

  // Specific Foods & Nutrients
  { title: "Magnesium for Constipation and Gut Motility", category: "diet" },
  { title: "Vitamin D and Your Gut Microbiome", category: "microbiome" },
  { title: "Omega-3 Fatty Acids for Gut Inflammation", category: "diet" },
  { title: "Zinc and Gut Health: Why Deficiency Causes Leaky Gut", category: "gut-repair" },
  { title: "B Vitamins and Gut Health: The Absorption Problem", category: "gut-repair" },
  { title: "Iron Deficiency and Gut Health: The Hidden Connection", category: "gut-repair" },
  { title: "How Polyphenols Feed Your Good Gut Bacteria", category: "microbiome" },
  { title: "Quercetin for Gut Inflammation and Mast Cell Activation", category: "gut-repair" },
  { title: "How Much Fiber Do You Actually Need for Gut Health?", category: "diet" },
  { title: "Inulin and FOS: The Prebiotics That Feed Your Microbiome", category: "microbiome" },
  { title: "Why Eating the Rainbow Matters for Your Gut", category: "diet" },
  { title: "Kefir vs Yogurt: Which Is Better for Your Gut?", category: "probiotics" },
  { title: "Kimchi and Sauerkraut: How Much Do You Need for Gut Benefits?", category: "probiotics" },
  { title: "Miso and Tempeh: Fermented Foods Beyond the Basics", category: "probiotics" },
  { title: "Kombucha: Gut Health Hero or Overhyped?", category: "probiotics" },

  // Research & Science
  { title: "The Latest Research on IBS Treatment (2024 Update)", category: "ibs" },
  { title: "What Gut Health Research Actually Proves vs What It Suggests", category: "microbiome" },
  { title: "The Problem with Most Probiotic Studies", category: "probiotics" },
  { title: "Why the Gut Microbiome Is Harder to Study Than You Think", category: "microbiome" },
  { title: "The Gut Microbiome and Cancer: What We Know So Far", category: "microbiome" },
  { title: "How Gut Research Is Changing Psychiatry", category: "gut-brain" },
  { title: "The Future of IBS Treatment: What's Coming", category: "ibs" },
  { title: "Gut Organoids: How Scientists Are Studying Your Gut in a Dish", category: "microbiome" },
  { title: "The Human Microbiome Project: What It Found", category: "microbiome" },
  { title: "Why Gut Health Research Is So Hard to Translate to Real Life", category: "microbiome" },

  // Relationships & Social
  { title: "How IBS Affects Relationships and Intimacy", category: "emotional-roots" },
  { title: "Dating with IBS: How to Navigate It", category: "emotional-roots" },
  { title: "How to Manage IBS at Work Without Losing Your Mind", category: "ibs" },
  { title: "IBS and Social Anxiety: The Feedback Loop", category: "gut-brain" },
  { title: "How to Stop IBS from Running Your Social Life", category: "ibs" },
  { title: "When Your Partner Doesn't Understand Your Gut Issues", category: "emotional-roots" },
  { title: "How to Find a Doctor Who Actually Listens About IBS", category: "ibs" },
  { title: "IBS Support Groups: Why Community Matters for Healing", category: "emotional-roots" },
  { title: "How to Advocate for Yourself in the Medical System with IBS", category: "ibs" },
  { title: "The Financial Cost of IBS and How to Manage It", category: "ibs" },

  // Seasonal & Environmental
  { title: "How Seasonal Changes Affect Your Gut Microbiome", category: "microbiome" },
  { title: "Why Your IBS Is Worse in Winter", category: "ibs" },
  { title: "How Air Pollution Damages Your Gut Microbiome", category: "microbiome" },
  { title: "Pesticides and Your Gut: What the Research Shows", category: "microbiome" },
  { title: "How Chlorine in Tap Water Affects Your Gut Bacteria", category: "microbiome" },
  { title: "The Gut Benefits of Spending Time Outdoors", category: "microbiome" },
  { title: "How Mold Exposure Affects Your Gut Health", category: "gut-repair" },
  { title: "EMF and Gut Health: Is There a Connection?", category: "gut-repair" },
  { title: "How to Detox Your Environment for Better Gut Health", category: "gut-repair" },
  { title: "The Gut Microbiome of People Who Live in Nature vs Cities", category: "microbiome" },

  // Specific Populations
  { title: "Gut Health for Athletes: The Performance-Microbiome Connection", category: "microbiome" },
  { title: "IBS in Men: Why It's Underdiagnosed and Undertreated", category: "ibs" },
  { title: "Gut Health for Vegans and Vegetarians", category: "diet" },
  { title: "Gut Health on a Carnivore Diet: The Evidence", category: "diet" },
  { title: "IBS and Chronic Fatigue Syndrome: The Overlap", category: "ibs" },
  { title: "Gut Health for Night Shift Workers", category: "microbiome" },
  { title: "Gut Health for People with Autoimmune Conditions", category: "gut-repair" },
  { title: "IBS and Fibromyalgia: The Central Sensitization Connection", category: "ibs" },
  { title: "Gut Health for People with Diabetes", category: "microbiome" },
  { title: "Gut Health After Weight Loss Surgery", category: "gut-repair" },

  // Practical Guides
  { title: "How to Start a Gut Healing Protocol (Without Overwhelm)", category: "gut-repair" },
  { title: "The Gut Healing Grocery List: What to Buy Every Week", category: "diet" },
  { title: "How to Read a Probiotic Label (What Actually Matters)", category: "probiotics" },
  { title: "The Gut Health Supplement Stack: What Works Together", category: "gut-repair" },
  { title: "How to Track Your Gut Symptoms Effectively", category: "ibs" },
  { title: "The IBS Food Diary: How to Use It Properly", category: "ibs" },
  { title: "How to Meal Prep for Gut Health", category: "diet" },
  { title: "Gut-Friendly Recipes for IBS Flare Days", category: "diet" },
  { title: "How to Find a Functional Medicine Doctor for Gut Issues", category: "gut-repair" },
  { title: "The Gut Health Checklist: 20 Things to Do This Week", category: "gut-repair" },

  // Additional IBS Topics
  { title: "Post-COVID IBS: Why Your Gut Changed After Infection", category: "ibs" },
  { title: "IBS and PCOS: The Hormonal-Gut Connection", category: "ibs" },
  { title: "IBS and Interstitial Cystitis: The Pelvic Pain Connection", category: "ibs" },
  { title: "IBS and Restless Leg Syndrome: An Unexpected Link", category: "ibs" },
  { title: "IBS and Eczema: The Gut-Skin Axis in Action", category: "ibs" },
  { title: "IBS and Migraines: The Gut-Brain Pain Connection", category: "gut-brain" },
  { title: "IBS and Asthma: The Gut-Lung Axis", category: "microbiome" },
  { title: "IBS and Thyroid Disease: The Gut-Thyroid Connection", category: "ibs" },
  { title: "IBS and Anemia: Why Your Gut Might Be Stealing Your Iron", category: "ibs" },
  { title: "IBS and Osteoporosis: The Calcium Absorption Problem", category: "ibs" },

  // More Gut Repair
  { title: "How to Heal Your Gut After Years of NSAIDs", category: "gut-repair" },
  { title: "How Birth Control Pills Affect Your Gut Microbiome", category: "microbiome" },
  { title: "How PPIs (Proton Pump Inhibitors) Damage Your Gut Long-Term", category: "gut-repair" },
  { title: "How Metformin Affects Your Gut Microbiome", category: "microbiome" },
  { title: "How Statins Change Your Gut Bacteria", category: "microbiome" },
  { title: "How to Wean Off PPIs Safely While Supporting Your Gut", category: "gut-repair" },
  { title: "The Gut Healing Protocol for People Who Can't Afford Supplements", category: "gut-repair" },
  { title: "How to Heal Your Gut in 90 Days: A Realistic Plan", category: "gut-repair" },
  { title: "Why Your Gut Healing Plateau Isn't Permanent", category: "gut-repair" },
  { title: "How to Know When Your Gut Is Actually Healing", category: "gut-repair" },
];

// ─── Main bulk seed function ──────────────────────────────────────────────────
async function bulkSeed() {
  console.log('[bulk-seed] Starting bulk seed of 500 articles...');
  console.log(`[bulk-seed] Using model: ${process.env.OPENAI_MODEL || 'deepseek-v4-pro'}`);

  await initDb();

  // Get already-seeded titles to avoid duplicates
  const existing = await query(`SELECT title FROM articles`, []);
  const existingTitles = new Set(existing.rows.map(r => r.title.toLowerCase()));
  console.log(`[bulk-seed] ${existingTitles.size} articles already in DB`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < TOPICS.length; i++) {
    const { title, category } = TOPICS[i];

    if (existingTitles.has(title.toLowerCase())) {
      console.log(`[bulk-seed] [${i+1}/500] SKIP (exists): ${title}`);
      skipped++;
      continue;
    }

    console.log(`[bulk-seed] [${i+1}/500] Generating: ${title}`);

    try {
      const result = await generateArticle(title, category);

      if (!result.ok || !result.html) {
        console.error(`[bulk-seed] [${i+1}/500] FAILED gate after 4 attempts: ${title}`);
        failed++;
        continue;
      }

      const slug = slugify(title);
      const meta = await generateMeta(title, result.html);
      const readingTime = estimateReadingTime(result.html);
      const wordCount = result.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;

      // Assign hero image from library rotation
      const imageUrl = await assignHeroImage(slug);
      const imageAlt = `${title} - gut health article`;

      // Insert as QUEUED — cron will publish on schedule
      await query(
        `INSERT INTO articles
          (slug, title, body, meta_description, og_title, og_description,
           category, image_url, image_alt, reading_time, word_count,
           status, queued_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'queued',NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [
          slug, title, result.html, meta, title, meta,
          category, imageUrl, imageAlt, readingTime, wordCount
        ]
      );

      generated++;
      existingTitles.add(title.toLowerCase());
      console.log(`[bulk-seed] [${i+1}/500] OK: ${title} (${wordCount} words, ${readingTime} min read)`);

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));

    } catch (err) {
      console.error(`[bulk-seed] [${i+1}/500] ERROR: ${title}:`, err.message);
      failed++;
    }
  }

  console.log(`\n[bulk-seed] Complete.`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Failed:    ${failed}`);

  await close();
}

bulkSeed().catch(err => {
  console.error('[bulk-seed] Fatal error:', err);
  process.exit(1);
});
