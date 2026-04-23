import pg from 'pg';

const { Pool } = pg;

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
    pool.on('error', (err) => {
      console.error('[db] Unexpected pool error:', err);
    });
  }
  return pool;
}

export async function query(text, params) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function initDb() {
  console.log('[db] Initializing schema...');
  await query(`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      meta_description TEXT,
      og_title TEXT,
      og_description TEXT,
      category TEXT NOT NULL DEFAULT 'gut-health',
      tags TEXT[] DEFAULT '{}',
      image_url TEXT,
      image_alt TEXT,
      reading_time INTEGER DEFAULT 8,
      author TEXT DEFAULT 'The Oracle Lover',
      published BOOLEAN DEFAULT true,
      published_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      word_count INTEGER DEFAULT 0,
      asins_used TEXT[] DEFAULT '{}',
      cta_primary TEXT,
      last_refreshed_30d TIMESTAMPTZ,
      last_refreshed_90d TIMESTAMPTZ,
      opener_type TEXT,
      conclusion_type TEXT
    );
  `, []);

  await query(`
    CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);
    CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published, published_at DESC);
    CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);
  `, []);

  await query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      subscribed_at TIMESTAMPTZ DEFAULT NOW()
    );
  `, []);

  await query(`
    CREATE INDEX IF NOT EXISTS newsletter_email_idx ON newsletter_subscribers(email);
  `, []);

  console.log('[db] Schema ready.');
}
