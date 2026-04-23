// Bunny CDN credentials for yourgut-healed storage zone
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'yourgut-healed';
const BUNNY_API_KEY = process.env.BUNNY_API_KEY || '57e9489d-942f-4df4-82be3b5e74df-b7d2-42a4';
const BUNNY_ENDPOINT = `https://ny.storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}`;
const BUNNY_PULL_ZONE = process.env.BUNNY_PULL_ZONE_URL || 'https://yourgut-healed.b-cdn.net';

/**
 * Upload a buffer or file to Bunny CDN
 * @param {Buffer} buffer - File content
 * @param {string} remotePath - Path within storage zone e.g. "images/articles/slug.webp"
 * @param {string} contentType - MIME type
 * @returns {string} Public CDN URL
 */
export async function uploadToBunny(buffer, remotePath, contentType = 'image/webp') {
  const url = `${BUNNY_ENDPOINT}/${remotePath}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_API_KEY,
      'Content-Type': contentType
    },
    body: buffer
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Bunny CDN upload failed: ${response.status} ${text}`);
  }

  return `${BUNNY_PULL_ZONE}/${remotePath}`;
}

/**
 * Upload a WOFF2 font file
 */
export async function uploadFont(buffer, filename) {
  return uploadToBunny(buffer, `fonts/${filename}`, 'font/woff2');
}

/**
 * Upload an article hero image (WebP)
 */
export async function uploadArticleImage(buffer, slug) {
  return uploadToBunny(buffer, `images/articles/${slug}.webp`, 'image/webp');
}

/**
 * Upload a general site image
 */
export async function uploadSiteImage(buffer, filename) {
  return uploadToBunny(buffer, `images/${filename}`, 'image/webp');
}

export { BUNNY_PULL_ZONE };
