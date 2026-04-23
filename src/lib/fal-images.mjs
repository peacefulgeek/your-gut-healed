// FAL.ai image generation for article hero images
// Uses fal-ai/flux/schnell for fast, high-quality images

const FAL_KEY = process.env.FAL_KEY;
const FAL_API = 'https://fal.run/fal-ai/flux/schnell';

const CATEGORY_PROMPTS = {
  'gut-brain': 'serene illustration of a glowing neural network connecting stomach and brain, soft warm tones, medical art style, no text',
  'ibs': 'peaceful abstract illustration of digestive system with calming sage green and cream colors, botanical elements, no text',
  'sibo': 'microscopic view of gut bacteria in warm amber tones, scientific illustration style, beautiful and calming, no text',
  'diet': 'beautiful arrangement of gut-healing foods, colorful vegetables, fermented foods, warm natural lighting, no text',
  'leaky-gut': 'abstract illustration of intestinal lining healing, warm golden light, cellular repair imagery, no text',
  'emotional-roots': 'gentle illustration of body-mind connection, person in peaceful meditation, soft warm colors, no text',
  'tcm': 'traditional Chinese medicine herbs and acupuncture elements, warm earthy tones, artistic illustration, no text',
  'probiotics': 'colorful microscopic probiotic bacteria illustration, friendly and scientific, warm tones, no text',
  'testing': 'clean medical illustration of gut health testing, laboratory equipment, warm clinical aesthetic, no text',
  'bloating': 'soothing illustration of abdominal comfort, herbs and natural remedies, warm sage tones, no text',
  'vagus-nerve': 'elegant illustration of vagus nerve pathway, glowing neural connections, peaceful blue-green tones, no text',
  'digestive-enzymes': 'beautiful illustration of digestive process, enzyme molecules, warm amber and cream tones, no text',
  'acid-reflux': 'calming illustration of esophagus and stomach, healing light, warm tones, medical art style, no text',
  'microbiome': 'vibrant illustration of diverse gut microbiome, colorful bacteria, warm scientific art style, no text',
  'ayurveda': 'Ayurvedic herbs and spices for digestion, turmeric, ginger, warm golden tones, artistic, no text',
  'herbal': 'beautiful arrangement of medicinal herbs for gut health, peppermint, chamomile, warm natural tones, no text',
  'gut-skin': 'illustration connecting gut health to glowing skin, botanical elements, warm cream tones, no text',
  'candida': 'microscopic illustration of yeast and beneficial bacteria balance, warm tones, scientific art, no text',
  'gut-repair': 'healing illustration of intestinal lining repair, golden light, cellular renewal, warm tones, no text',
  'functional-medicine': 'clean illustration of functional medicine approach, holistic body diagram, warm clinical tones, no text',
  'gut-health': 'beautiful illustration of healthy digestive system, warm cream and sage colors, botanical elements, no text',
  'default': 'serene illustration of gut health and healing, warm cream and sage green tones, botanical elements, peaceful, no text'
};

export async function generateHeroImage(title, category) {
  if (!FAL_KEY) {
    throw new Error('FAL_KEY not set');
  }

  const basePrompt = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS['default'];
  const prompt = `${basePrompt}, high quality digital illustration, 1200x630 aspect ratio, professional health website hero image`;

  const response = await fetch(FAL_API, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      image_size: 'landscape_16_9',
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: true
    }),
    signal: AbortSignal.timeout(60000)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FAL API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  const imageUrl = data.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error('FAL API returned no image URL');
  }

  // Download the image
  const imgResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
  if (!imgResponse.ok) {
    throw new Error(`Failed to download generated image: ${imgResponse.status}`);
  }

  const arrayBuffer = await imgResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
