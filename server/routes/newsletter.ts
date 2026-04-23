import express from 'express';
import { query } from '../../src/lib/db.mjs';

export const newsletterRouter = express.Router();

// POST /api/newsletter/subscribe
newsletterRouter.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email required' });
    }
    const normalized = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    await query(
      `INSERT INTO newsletter_subscribers (email, subscribed_at)
       VALUES ($1, NOW())
       ON CONFLICT (email) DO NOTHING`,
      [normalized]
    );

    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    console.error('[newsletter] subscribe error:', err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});
