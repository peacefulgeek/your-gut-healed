import express from 'express';
import { query } from '../../src/lib/db.mjs';

export const articlesRouter = express.Router();

// GET /api/articles — list with filtering, pagination, full-text search
// CRITICAL: ALWAYS filter by status = 'published'. Queued articles must NEVER leak.
articlesRouter.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit || '12'), 10), 50);
    const offset = parseInt(String(req.query.offset || '0'), 10);
    const category = String(req.query.category || '');
    const q = String(req.query.q || '').trim();

    const conditions: string[] = ["status = 'published'"];
    const params: any[] = [];
    let paramIdx = 1;

    if (category) {
      conditions.push(`category = $${paramIdx++}`);
      params.push(category);
    }

    if (q) {
      conditions.push(`(
        to_tsvector('english', title || ' ' || COALESCE(meta_description, '') || ' ' || COALESCE(array_to_string(tags, ' '), ''))
        @@ plainto_tsquery('english', $${paramIdx++})
        OR title ILIKE $${paramIdx++}
      )`);
      params.push(q, `%${q}%`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) as total FROM articles ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const listParams = [...params, limit, offset];
    const result = await query(
      `SELECT slug, title, meta_description, image_url, image_alt, category, tags,
              published_at, reading_time, author, word_count
       FROM articles
       ${where}
       ORDER BY published_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      listParams
    );

    res.json({ articles: result.rows, total, limit, offset });
  } catch (err) {
    console.error('[api/articles] list error:', err);
    res.status(500).json({ error: 'Failed to load articles' });
  }
});

// GET /api/articles/:slug — single article with related
// CRITICAL: status = 'published' guard on every query.
articlesRouter.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await query(
      `SELECT slug, title, body, meta_description, og_title, og_description,
              image_url, image_alt, category, tags, published_at, reading_time,
              author, word_count, asins_used, cta_primary, opener_type, conclusion_type
       FROM articles
       WHERE slug = $1 AND status = 'published'`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const article = result.rows[0];

    // Related: same category first, then recent — always published only
    const relatedResult = await query(
      `SELECT slug, title, meta_description, image_url, image_alt, category,
              published_at, reading_time
       FROM articles
       WHERE category = $1 AND slug != $2 AND status = 'published'
       ORDER BY published_at DESC
       LIMIT 4`,
      [article.category, slug]
    );

    let related = relatedResult.rows;
    if (related.length < 3) {
      const fillResult = await query(
        `SELECT slug, title, meta_description, image_url, image_alt, category,
                published_at, reading_time
         FROM articles
         WHERE slug != $1 AND status = 'published'
         ORDER BY published_at DESC
         LIMIT 4`,
        [slug]
      );
      const existing = new Set(related.map((r: any) => r.slug));
      related = [...related, ...fillResult.rows.filter((r: any) => !existing.has(r.slug))].slice(0, 3);
    }

    res.json({ article, related });
  } catch (err) {
    console.error('[api/articles] single error:', err);
    res.status(500).json({ error: 'Failed to load article' });
  }
});
