import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';
import { NewsletterSignup } from '../components/NewsletterSignup';

interface Article {
  slug: string;
  title: string;
  meta_description: string;
  image_url: string;
  image_alt: string;
  category: string;
  published_at: string;
  reading_time: number;
}

const CATEGORIES = [
  { key: 'ibs', label: 'IBS', icon: '🌿' },
  { key: 'gut-brain', label: 'Gut-Brain', icon: '🧠' },
  { key: 'microbiome', label: 'Microbiome', icon: '🔬' },
  { key: 'emotional-roots', label: 'Emotional Roots', icon: '💛' },
  { key: 'diet', label: 'Diet & Food', icon: '🥦' },
  { key: 'gut-repair', label: 'Gut Repair', icon: '✨' },
];

export function HomePage() {
  const [featured, setFeatured] = useState<Article[]>([]);
  const [recent, setRecent] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [featRes, recRes] = await Promise.all([
          fetch('/api/articles?limit=3&sort=featured'),
          fetch('/api/articles?limit=6&sort=recent&offset=3')
        ]);
        const [featData, recData] = await Promise.all([featRes.json(), recRes.json()]);
        setFeatured(featData.articles || []);
        setRecent(recData.articles || []);
      } catch (e) {
        console.error('Failed to load articles:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="home-page">
      {/* ─── Hero ─── */}
      <section className="home-hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-bg-circle hero-bg-circle-1" />
          <div className="hero-bg-circle hero-bg-circle-2" />
          <div className="hero-bg-circle hero-bg-circle-3" />
        </div>
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="hero-eyebrow">The Quiet Gut</span>
            <h1 className="hero-title">
              Your gut isn't just digesting food.<br />
              <em>It's digesting your life.</em>
            </h1>
            <p className="hero-subtitle">
              Evidence-based, emotionally honest writing on IBS, the gut-brain connection,
              SIBO, the microbiome, and the emotional roots of digestive pain.
              Written by someone who has lived it.
            </p>
            <div className="hero-actions">
              <Link to="/gut-health-quiz" className="btn-primary">
                Take the Gut Health Quiz
              </Link>
              <Link to="/articles" className="btn-secondary">
                Read the Articles
              </Link>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-visual-inner">
              <img
                src="https://yourgut-healed.b-cdn.net/images/hero-gut-healing.webp"
                alt="Gut healing illustration"
                width="560"
                height="480"
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="hero-stat-card hero-stat-1">
                <span className="stat-number">1 in 7</span>
                <span className="stat-label">people have IBS</span>
              </div>
              <div className="hero-stat-card hero-stat-2">
                <span className="stat-number">95%</span>
                <span className="stat-label">of serotonin is in your gut</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Category Pills ─── */}
      <section className="home-categories">
        <div className="container">
          <div className="category-pills">
            {CATEGORIES.map(cat => (
              <Link key={cat.key} to={`/articles?category=${cat.key}`} className="category-pill">
                <span className="pill-icon">{cat.icon}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Articles ─── */}
      <section className="home-featured">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Start Here</h2>
            <p className="section-subtitle">The articles that change how people understand their gut.</p>
          </div>
          {loading ? (
            <div className="articles-loading">
              {[1,2,3].map(i => <div key={i} className="article-skeleton" />)}
            </div>
          ) : featured.length > 0 ? (
            <div className="featured-grid">
              {featured[0] && (
                <div className="featured-main">
                  <ArticleCard {...featured[0]} imageUrl={featured[0].image_url} imageAlt={featured[0].image_alt} metaDescription={featured[0].meta_description} publishedAt={featured[0].published_at} readingTime={featured[0].reading_time} variant="featured" />
                </div>
              )}
              <div className="featured-side">
                {featured.slice(1).map(a => (
                  <ArticleCard key={a.slug} {...a} imageUrl={a.image_url} imageAlt={a.image_alt} metaDescription={a.meta_description} publishedAt={a.published_at} readingTime={a.reading_time} variant="default" />
                ))}
              </div>
            </div>
          ) : (
            <p className="no-articles">Articles loading soon. Check back shortly.</p>
          )}
        </div>
      </section>

      {/* ─── Quiz CTA ─── */}
      <section className="home-quiz-cta">
        <div className="container">
          <div className="quiz-cta-card">
            <div className="quiz-cta-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="var(--accent-soft)"/>
                <path d="M24 12C24 12 14 18 14 26C14 31.5228 18.4772 36 24 36C29.5228 36 34 31.5228 34 26C34 18 24 12 24 12Z" fill="var(--accent)" opacity="0.3"/>
                <path d="M24 12C24 12 14 18 14 26C14 31.5228 18.4772 36 24 36" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M24 12C24 12 34 18 34 26C34 31.5228 29.5228 36 24 36" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M24 36V20" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M24 24L20 20" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M24 28L28 24" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="quiz-cta-text">
              <h2 className="quiz-cta-title">What's really going on in your gut?</h2>
              <p className="quiz-cta-desc">
                Take the 3-minute Gut Health Assessment. Get a personalized reading of your digestive
                patterns, emotional connections, and where to start healing.
              </p>
            </div>
            <Link to="/gut-health-quiz" className="btn-primary quiz-cta-btn">
              Start the Free Quiz
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Recent Articles ─── */}
      {recent.length > 0 && (
        <section className="home-recent">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Recent Writing</h2>
              <Link to="/articles" className="section-link">View all articles &rarr;</Link>
            </div>
            <div className="articles-grid">
              {recent.map(a => (
                <ArticleCard key={a.slug} {...a} imageUrl={a.image_url} imageAlt={a.image_alt} metaDescription={a.meta_description} publishedAt={a.published_at} readingTime={a.reading_time} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── About Teaser ─── */}
      <section className="home-about">
        <div className="container">
          <div className="about-teaser">
            <div className="about-teaser-text">
              <span className="about-eyebrow">About This Site</span>
              <h2 className="about-title">Written by someone who has lived it.</h2>
              <p className="about-body">
                I'm The Oracle Lover. I spent years navigating IBS, SIBO, and the emotional weight
                that comes with a gut that won't cooperate. This site is what I wish had existed
                when I was searching for answers at 2am.
              </p>
              <p className="about-body">
                Everything here is evidence-based, emotionally honest, and written with the understanding
                that your gut symptoms are real, they have roots, and they can change.
              </p>
              <Link to="/about" className="btn-secondary">Read my story</Link>
            </div>
            <div className="about-teaser-visual" aria-hidden="true">
              <div className="about-quote-card">
                <blockquote>
                  "The gut is the seat of all feeling. Courage and fear both live there."
                </blockquote>
                <cite>Wentworth Dillon</cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Newsletter ─── */}
      <NewsletterSignup variant="banner" />

      <style>{homeStyles}</style>
    </div>
  );
}

const homeStyles = `
  /* ─── Hero ─── */
  .home-hero {
    position: relative;
    overflow: hidden;
    padding: var(--space-3xl) 0;
    background: linear-gradient(160deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .hero-bg-circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.5;
  }
  .hero-bg-circle-1 {
    width: 600px; height: 600px;
    background: radial-gradient(circle, var(--accent-soft) 0%, transparent 70%);
    top: -200px; right: -100px;
  }
  .hero-bg-circle-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, var(--accent-warm-soft) 0%, transparent 70%);
    bottom: -150px; left: -100px;
  }
  .hero-bg-circle-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, var(--accent-soft) 0%, transparent 70%);
    top: 50%; left: 40%;
  }
  .hero-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2xl);
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .hero-eyebrow {
    display: inline-block;
    font-family: var(--font-ui);
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--accent);
    background: var(--accent-soft);
    padding: 4px 12px;
    border-radius: var(--radius-xl);
    margin-bottom: var(--space-lg);
  }
  .hero-title {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: var(--space-lg);
    color: var(--text-primary);
  }
  .hero-title em {
    color: var(--accent-dark);
    font-style: italic;
  }
  .hero-subtitle {
    font-family: var(--font-body);
    font-size: 1.05rem;
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: var(--space-xl);
    max-width: 520px;
  }
  .hero-actions {
    display: flex;
    gap: var(--space-md);
    flex-wrap: wrap;
  }
  .btn-primary {
    display: inline-flex;
    align-items: center;
    background: var(--accent);
    color: #fff;
    font-family: var(--font-ui);
    font-size: 0.95rem;
    font-weight: 600;
    padding: 12px 24px;
    border-radius: var(--radius-xl);
    text-decoration: none;
    transition: background var(--transition-fast), transform var(--transition-fast);
    min-height: var(--tap-target-min);
  }
  .btn-primary:hover {
    background: var(--accent-dark);
    color: #fff;
    transform: translateY(-1px);
  }
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    background: transparent;
    color: var(--text-primary);
    font-family: var(--font-ui);
    font-size: 0.95rem;
    font-weight: 600;
    padding: 12px 24px;
    border-radius: var(--radius-xl);
    border: 1.5px solid var(--border);
    text-decoration: none;
    transition: border-color var(--transition-fast), background var(--transition-fast);
    min-height: var(--tap-target-min);
  }
  .btn-secondary:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
    color: var(--text-primary);
  }
  .hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .hero-visual-inner {
    position: relative;
    width: 100%;
    max-width: 480px;
  }
  .hero-visual-inner img {
    width: 100%;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
  }
  .hero-stat-card {
    position: absolute;
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: var(--space-md) var(--space-lg);
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .hero-stat-1 { bottom: 24px; left: -24px; }
  .hero-stat-2 { top: 24px; right: -24px; }
  .stat-number {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent-dark);
  }
  .stat-label {
    font-family: var(--font-ui);
    font-size: 0.75rem;
    color: var(--text-muted);
    white-space: nowrap;
  }

  /* ─── Categories ─── */
  .home-categories {
    padding: var(--space-xl) 0;
    border-bottom: 1px solid var(--border-light);
  }
  .category-pills {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
    justify-content: center;
  }
  .category-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 8px 16px;
    font-family: var(--font-ui);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    text-decoration: none;
    transition: all var(--transition-fast);
  }
  .category-pill:hover {
    background: var(--accent-soft);
    border-color: var(--accent-light);
    color: var(--accent-dark);
  }
  .pill-icon { font-size: 1rem; }

  /* ─── Sections ─── */
  .home-featured, .home-recent, .home-about {
    padding: var(--space-3xl) 0;
  }
  .section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: var(--space-xl);
    gap: var(--space-md);
  }
  .section-title {
    font-family: var(--font-heading);
    font-size: 1.8rem;
    font-weight: 700;
  }
  .section-subtitle {
    font-family: var(--font-ui);
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  .section-link {
    font-family: var(--font-ui);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--accent-dark);
    text-decoration: none;
    white-space: nowrap;
  }
  .section-link:hover { color: var(--accent); }

  /* ─── Featured Grid ─── */
  .featured-grid {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: var(--space-xl);
    align-items: start;
  }
  .featured-side {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  /* ─── Articles Grid ─── */
  .articles-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-xl);
  }
  .articles-loading {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-xl);
  }
  .article-skeleton {
    height: 320px;
    background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--border-light) 50%, var(--bg-secondary) 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s infinite;
    border-radius: var(--radius-lg);
  }
  @keyframes skeleton-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .no-articles {
    font-family: var(--font-ui);
    color: var(--text-muted);
    text-align: center;
    padding: var(--space-2xl);
  }

  /* ─── Quiz CTA ─── */
  .home-quiz-cta {
    padding: var(--space-2xl) 0;
    background: var(--bg-secondary);
  }
  .quiz-cta-card {
    display: flex;
    align-items: center;
    gap: var(--space-xl);
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-xl);
    padding: var(--space-xl) var(--space-2xl);
    box-shadow: var(--shadow-sm);
  }
  .quiz-cta-icon { flex-shrink: 0; }
  .quiz-cta-text { flex: 1; }
  .quiz-cta-title {
    font-family: var(--font-heading);
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: var(--space-sm);
  }
  .quiz-cta-desc {
    font-family: var(--font-ui);
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.6;
    max-width: 480px;
  }
  .quiz-cta-btn { flex-shrink: 0; }

  /* ─── About Teaser ─── */
  .about-teaser {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2xl);
    align-items: center;
  }
  .about-eyebrow {
    display: inline-block;
    font-family: var(--font-ui);
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--accent);
    margin-bottom: var(--space-md);
  }
  .about-title {
    font-family: var(--font-heading);
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: var(--space-lg);
    line-height: 1.25;
  }
  .about-body {
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: var(--space-md);
  }
  .about-quote-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-xl);
    padding: var(--space-2xl);
    position: relative;
  }
  .about-quote-card::before {
    content: '"';
    font-family: var(--font-heading);
    font-size: 6rem;
    color: var(--accent-light);
    position: absolute;
    top: -20px;
    left: var(--space-xl);
    line-height: 1;
  }
  .about-quote-card blockquote {
    font-family: var(--font-heading);
    font-size: 1.2rem;
    font-style: italic;
    color: var(--text-primary);
    border: none;
    padding: 0;
    margin: 0 0 var(--space-md);
    line-height: 1.6;
  }
  .about-quote-card cite {
    font-family: var(--font-ui);
    font-size: 0.8rem;
    color: var(--text-muted);
    font-style: normal;
  }

  /* ─── Responsive ─── */
  @media (max-width: 1024px) {
    .featured-grid { grid-template-columns: 1fr; }
    .featured-side { display: grid; grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    .hero-inner { grid-template-columns: 1fr; }
    .hero-visual { display: none; }
    .articles-grid { grid-template-columns: 1fr 1fr; }
    .articles-loading { grid-template-columns: 1fr 1fr; }
    .about-teaser { grid-template-columns: 1fr; }
    .about-teaser-visual { display: none; }
    .quiz-cta-card { flex-direction: column; text-align: center; }
    .quiz-cta-icon { display: none; }
    .featured-side { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .articles-grid { grid-template-columns: 1fr; }
    .articles-loading { grid-template-columns: 1fr; }
    .hero-actions { flex-direction: column; }
    .hero-actions .btn-primary, .hero-actions .btn-secondary { width: 100%; justify-content: center; }
  }
`;
