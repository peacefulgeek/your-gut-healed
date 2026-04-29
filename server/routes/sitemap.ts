import express from 'express';
import { query } from '../../src/lib/db.mjs';

export const sitemapRouter = express.Router();

const DOMAIN = 'https://yourgutHealed.com';

sitemapRouter.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT slug, published_at, updated_at FROM articles WHERE status = 'published' ORDER BY published_at DESC`,
      []
    );

    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/about', priority: '0.8', changefreq: 'monthly' },
      { loc: '/articles', priority: '0.9', changefreq: 'daily' },
      { loc: '/gut-healing-toolkit', priority: '0.8', changefreq: 'weekly' },
      { loc: '/privacy', priority: '0.3', changefreq: 'yearly' }
    ];

    const urls = [
      ...staticPages.map(p => `
  <url>
    <loc>${DOMAIN}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
      ...rows.map(a => `
  <url>
    <loc>${DOMAIN}/articles/${a.slug}</loc>
    <lastmod>${new Date(a.updated_at || a.published_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`)
    ].join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('[sitemap] error:', err);
    res.status(500).send('Error generating sitemap');
  }
});
