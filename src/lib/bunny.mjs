/**
 * bunny.mjs
 * Bunny CDN helper for YourGutHealed.com
 *
 * Image strategy: library rotation
 * - 40 pre-generated WebP images live at /library/lib-01.webp ... lib-40.webp
 * - Each new article gets a unique /images/{slug}.webp by copying a random lib image
 * - This gives Google a unique, indexable URL per article with zero generation cost
 *
 * Credentials are hardcoded per infrastructure spec (ADDENDUMSCOPENOCLAUDE.md §4).
 */

// ─── Hardcoded credentials (per spec - do not move to env vars) ──────────────
const BUNNY_STORAGE_ZONE = 'yourgut-healed';
const BUNNY_API_KEY = '57e9489d-942f-4df4-82be3b5e74df-b7d2-42a4';
const BUNNY_PULL_ZONE = 'https://yourgut-healed.b-cdn.net';
const BUNNY_HOSTNAME = 'ny.storage.bunnycdn.com';

// ─── Assign hero image from library rotation ──────────────────────────────────
export async function assignHeroImage(slug) {
  const libNum = String(Math.floor(Math.random() * 40) + 1).padStart(2, '0');
  const sourceFile = `lib-${libNum}.webp`;
  const destFile = `${slug}.webp`;

  try {
    // Download from library
    const sourceUrl = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
    const downloadRes = await fetch(sourceUrl);
    if (!downloadRes.ok) throw new Error(`Library download failed: ${downloadRes.status} ${sourceUrl}`);
    const imageBuffer = await downloadRes.arrayBuffer();

    // Upload as article-specific image
    const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/images/${destFile}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'image/webp'
      },
      body: imageBuffer
    });

    if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);

    const finalUrl = `${BUNNY_PULL_ZONE}/images/${destFile}`;
    console.log(`[bunny] Hero assigned: ${finalUrl} (source: ${sourceFile})`);
    return finalUrl;

  } catch (err) {
    // Fallback: link directly to library image (still a valid CDN URL)
    const fallbackUrl = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
    console.warn(`[bunny] assignHeroImage fallback for "${slug}": ${err.message} -> ${fallbackUrl}`);
    return fallbackUrl;
  }
}

// ─── Generic file upload (for other assets) ───────────────────────────────────
export async function uploadToBunny(buffer, remotePath, contentType = 'image/webp') {
  const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${remotePath}`;
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_API_KEY,
      'Content-Type': contentType
    },
    body: buffer
  });
  if (!res.ok) throw new Error(`Bunny upload failed: ${res.status} for ${remotePath}`);
  return `${BUNNY_PULL_ZONE}/${remotePath}`;
}

// ─── Legacy wrappers (kept for compatibility) ─────────────────────────────────
export async function uploadArticleImage(buffer, slug) {
  return uploadToBunny(buffer, `images/${slug}.webp`, 'image/webp');
}

export async function uploadFont(buffer, filename) {
  return uploadToBunny(buffer, `fonts/${filename}`, 'font/woff2');
}

export async function uploadSiteImage(buffer, filename) {
  return uploadToBunny(buffer, `images/${filename}`, 'image/webp');
}

// ─── Placeholder image URL ────────────────────────────────────────────────────
export function getPlaceholderUrl() {
  return `${BUNNY_PULL_ZONE}/images/placeholder-gut.webp`;
}

export { BUNNY_PULL_ZONE, BUNNY_STORAGE_ZONE };
