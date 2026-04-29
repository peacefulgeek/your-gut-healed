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

  // Main articles table with queue-based publishing
  // status: 'queued' | 'published'
  // queued_at: when the article was generated and placed in queue
  // published_at: when it went live (NULL until published)
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
      status TEXT NOT NULL DEFAULT 'queued',
      queued_at TIMESTAMPTZ DEFAULT NOW(),
      published_at TIMESTAMPTZ,
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

  // Migrate existing rows: if they have old 'published' boolean column, convert to status
  await query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'articles' AND column_name = 'published'
      ) THEN
        -- Add status column if missing
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'articles' AND column_name = 'status'
        ) THEN
          ALTER TABLE articles ADD COLUMN status TEXT NOT NULL DEFAULT 'queued';
        END IF;
        -- Migrate data
        UPDATE articles SET status = CASE WHEN published = true THEN 'published' ELSE 'queued' END
          WHERE status = 'queued';
        -- Add queued_at if missing
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'articles' AND column_name = 'queued_at'
        ) THEN
          ALTER TABLE articles ADD COLUMN queued_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        -- Drop old boolean column
        ALTER TABLE articles DROP COLUMN IF EXISTS published;
      END IF;
    END $$;
  `, []);

  // Indexes
  await query(`
    CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);
    CREATE INDEX IF NOT EXISTS articles_status_idx ON articles(status, published_at DESC);
    CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);
    CREATE INDEX IF NOT EXISTS articles_queued_idx ON articles(status, queued_at ASC);
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
