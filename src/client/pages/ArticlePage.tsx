import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { TableOfContents } from '../components/TableOfContents';
import { ShareButtons } from '../components/ShareButtons';
import { ArticleCard } from '../components/ArticleCard';
import { NewsletterSignup } from '../components/NewsletterSignup';

interface Article {
  slug: string;
  title: string;
  body: string;
  meta_description: string;
  image_url: string;
  image_alt: string;
  category: string;
  tags: string[];
  published_at: string;
  reading_time: number;
  author: string;
  word_count: number;
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

const PLACEHOLDER = 'https://yourgut-healed.b-cdn.net/images/placeholder-gut.webp';

function extractTOC(html: string): TOCItem[] {
  const items: TOCItem[] = [];
  const re = /<h([23])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h[23]>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    items.push({
      level: parseInt(m[1]),
      id: m[2],
      text: m[3].replace(/<[^>]+>/g, '').trim()
    });
  }
  return items;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return ''; }
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/articles/${slug}`)
      .then(r => {
        if (!r.ok) { navigate('/404', { replace: true }); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setArticle(data.article);
        setToc(extractTOC(data.article.body));
        setRelated(data.related || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  useEffect(() => {
    function onScroll() {
      const el = document.getElementById('article-body');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight;
      const scrolled = Math.max(0, -rect.top);
      setReadProgress(Math.min(100, Math.round((scrolled / total) * 100)));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [article]);

  if (loading) {
    return (
      <div className="article-loading container">
        <div className="article-skeleton-hero" />
        <div className="article-skeleton-body">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton-line" style={{ width: `${70 + Math.random() * 30}%` }} />)}
        </div>
        <style>{skeletonStyles}</style>
      </div>
    );
  }

  if (!article) return null;

  const img = article.image_url || PLACEHOLDER;

  return (
    <div className="article-page">
      {/* ─── Read Progress Bar ─── */}
      <div className="read-progress" style={{ width: `${readProgress}%` }} aria-hidden="true" />

      {/* ─── Share Buttons (desktop sidebar) ─── */}
      <ShareButtons title={article.title} />

      {/* ─── Hero ─── */}
      <div className="article-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/articles">Articles</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{article.title}</span>
          </nav>
          <div className="article-meta-top">
            <span className="article-category-badge">{article.category?.replace(/-/g, ' ')}</span>
            <span className="article-reading-time">{article.reading_time} min read</span>
          </div>
          <h1 className="article-title">{article.title}</h1>
          <p className="article-meta-desc">{article.meta_description}</p>
          <div className="article-byline">
            <span className="byline-author">By <a href="https://theoraclelover.com" target="_blank" rel="noopener noreferrer">{article.author || 'The Oracle Lover'}</a></span>
            {article.published_at && <span className="byline-date">{formatDate(article.published_at)}</span>}
            {article.word_count && <span className="byline-words">{article.word_count.toLocaleString()} words</span>}
          </div>
        </div>
      </div>

      {/* ─── Hero Image ─── */}
      <div className="article-hero-img container">
        <img
          src={img}
          alt={article.image_alt || article.title}
          width="1200"
          height="630"
          loading="eager"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
        />
      </div>

      {/* ─── Content ─── */}
      <div className="article-content-wrap container">
        <div className="article-layout">
          <div className="article-main">
            {/* TOC */}
            {toc.length >= 3 && <TableOfContents headings={toc} />}

            {/* Body */}
            <div
              id="article-body"
              className="article-body prose"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="article-tags">
                <span className="tags-label">Topics:</span>
                {article.tags.map(tag => (
                  <Link key={tag} to={`/articles?q=${encodeURIComponent(tag)}`} className="article-tag">
                    {tag.replace(/-/g, ' ')}
                  </Link>
                ))}
              </div>
            )}

            {/* Share (inline, mobile) */}
            <div className="share-inline">
              <span className="share-inline-label">Share this article:</span>
              <div className="share-inline-btns">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="share-inline-btn"
                >Twitter</a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="share-inline-btn"
                >Facebook</a>
              </div>
            </div>

            {/* Newsletter */}
            <NewsletterSignup variant="inline" />
          </div>

          {/* Sidebar */}
          <aside className="article-sidebar">
            <NewsletterSignup variant="sidebar" />

            {related.length > 0 && (
              <div className="sidebar-related">
                <h3 className="sidebar-title">Related Articles</h3>
                {related.map(r => (
                  <ArticleCard
                    key={r.slug}
                    slug={r.slug}
                    title={r.title}
                    imageUrl={r.image_url}
                    imageAlt={r.image_alt}
                    category={r.category}
                    readingTime={r.reading_time}
                    variant="compact"
                  />
                ))}
              </div>
            )}

            <div className="sidebar-quiz-cta">
              <h4>Not sure where to start?</h4>
              <p>Take the 3-minute gut health quiz and get a personalized reading.</p>
              <Link to="/gut-health-quiz" className="sidebar-quiz-btn">Take the Quiz</Link>
            </div>
          </aside>
        </div>
      </div>

      {/* ─── Related Articles ─── */}
      {related.length > 0 && (
        <section className="article-related">
          <div className="container">
            <h2 className="related-title">Keep Reading</h2>
            <div className="related-grid">
              {related.slice(0, 3).map(r => (
                <ArticleCard
                  key={r.slug}
                  slug={r.slug}
                  title={r.title}
                  metaDescription={r.meta_description}
                  imageUrl={r.image_url}
                  imageAlt={r.image_alt}
                  category={r.category}
                  publishedAt={r.published_at}
                  readingTime={r.reading_time}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{articleStyles}</style>
    </div>
  );
}

const skeletonStyles = `
  .article-loading { padding: var(--space-2xl) 0; }
  .article-skeleton-hero {
    height: 400px;
    background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--border-light) 50%, var(--bg-secondary) 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s infinite;
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-xl);
  }
  .article-skeleton-body { max-width: var(--max-content-width); margin: 0 auto; }
  .skeleton-line {
    height: 18px;
    background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--border-light) 50%, var(--bg-secondary) 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s infinite;
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-md);
  }
  @keyframes skeleton-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const articleStyles = `
  .article-page { padding-bottom: var(--space-3xl); }

  /* Progress bar */
  .read-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: var(--accent);
    z-index: 200;
    transition: width 100ms linear;
  }

  /* Hero */
  .article-hero {
    padding: var(--space-xl) 0 var(--space-lg);
    background: linear-gradient(160deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
    border-bottom: 1px solid var(--border-light);
  }
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-family: var(--font-ui);
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-bottom: var(--space-lg);
    flex-wrap: wrap;
  }
  .breadcrumb a { color: var(--text-muted); text-decoration: none; }
  .breadcrumb a:hover { color: var(--accent-dark); }
  .breadcrumb span[aria-current] { color: var(--text-secondary); }
  .article-meta-top {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
  }
  .article-category-badge {
    background: var(--accent);
    color: #fff;
    font-family: var(--font-ui);
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 3px 10px;
    border-radius: var(--radius-xl);
    text-transform: capitalize;
  }
  .article-reading-time {
    font-family: var(--font-ui);
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  .article-title {
    font-family: var(--font-heading);
    font-size: clamp(1.8rem, 3.5vw, 2.8rem);
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: var(--space-md);
    max-width: 800px;
  }
  .article-meta-desc {
    font-family: var(--font-body);
    font-size: 1.1rem;
    color: var(--text-secondary);
    font-style: italic;
    line-height: 1.6;
    margin-bottom: var(--space-lg);
    max-width: 700px;
  }
  .article-byline {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    flex-wrap: wrap;
  }
  .byline-author {
    font-family: var(--font-ui);
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  .byline-author a { color: var(--accent-dark); font-weight: 600; text-decoration: none; }
  .byline-date, .byline-words {
    font-family: var(--font-ui);
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  /* Hero image */
  .article-hero-img {
    margin: var(--space-xl) auto;
  }
  .article-hero-img img {
    width: 100%;
    max-height: 500px;
    object-fit: cover;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
  }

  /* Layout */
  .article-content-wrap { margin-bottom: var(--space-2xl); }
  .article-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: var(--space-2xl);
    align-items: start;
  }
  .article-sidebar {
    position: sticky;
    top: 88px;
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  /* Prose */
  .prose {
    font-family: var(--font-body);
    font-size: var(--body-font-size-desktop);
    line-height: var(--line-height-body);
    color: var(--text-primary);
    max-width: var(--max-content-width);
  }
  .prose h2 {
    font-size: 1.6rem;
    margin-top: 2.5em;
    margin-bottom: 0.75em;
    padding-top: 0.5em;
    border-top: 1px solid var(--border-light);
  }
  .prose h3 {
    font-size: 1.25rem;
    margin-top: 2em;
    margin-bottom: 0.6em;
  }
  .prose h4 { font-size: 1.05rem; margin-top: 1.5em; margin-bottom: 0.5em; }
  .prose p { margin-bottom: 1.4em; }
  .prose ul, .prose ol { margin-bottom: 1.4em; padding-left: 1.6em; }
  .prose li { margin-bottom: 0.5em; }
  .prose blockquote {
    border-left: 3px solid var(--accent);
    padding: var(--space-md) var(--space-lg);
    margin: var(--space-xl) 0;
    background: var(--bg-secondary);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    font-style: italic;
    color: var(--text-secondary);
  }
  .prose a {
    color: var(--accent-dark);
    text-decoration: underline;
    text-decoration-color: var(--accent-light);
    text-underline-offset: 3px;
    font-weight: 500;
  }
  .prose a:hover { color: var(--accent); }
  .prose a[rel*="sponsored"] {
    background: var(--accent-warm-soft);
    padding: 1px 4px;
    border-radius: 3px;
    text-decoration-color: var(--accent-warm);
    color: #8B5E3C;
  }
  .prose strong { font-weight: 700; }
  .prose em { font-style: italic; }
  .prose hr { border: none; border-top: 1px solid var(--border); margin: var(--space-xl) 0; }
  .prose img {
    border-radius: var(--radius-md);
    margin: var(--space-xl) 0;
    box-shadow: var(--shadow-sm);
  }
  .prose .disclaimer, .prose .health-disclaimer {
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: var(--space-md) var(--space-lg);
    font-family: var(--font-ui);
    font-size: 0.8rem;
    color: var(--text-muted);
    line-height: 1.6;
    margin: var(--space-xl) 0;
  }
  .prose .amazon-disclosure {
    background: var(--accent-warm-soft);
    border: 1px solid #e8c89a;
    border-radius: var(--radius-md);
    padding: var(--space-md) var(--space-lg);
    font-family: var(--font-ui);
    font-size: 0.8rem;
    color: #8B5E3C;
    margin: var(--space-xl) 0;
  }
  .prose .author-bio {
    background: var(--bg-secondary);
    border-top: 2px solid var(--accent);
    padding: var(--space-lg);
    margin-top: var(--space-2xl);
    border-radius: var(--radius-md);
    font-family: var(--font-ui);
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }
  .prose .mantra {
    text-align: center;
    font-style: italic;
    color: var(--accent-dark);
    font-size: 1.05rem;
    margin: var(--space-xl) 0;
    padding: var(--space-lg);
    border-top: 1px solid var(--border-light);
    border-bottom: 1px solid var(--border-light);
  }

  /* Tags */
  .article-tags {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-wrap: wrap;
    margin: var(--space-xl) 0;
    padding-top: var(--space-lg);
    border-top: 1px solid var(--border-light);
  }
  .tags-label {
    font-family: var(--font-ui);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .article-tag {
    font-family: var(--font-ui);
    font-size: 0.75rem;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    padding: 3px 10px;
    border-radius: var(--radius-xl);
    text-decoration: none;
    border: 1px solid var(--border-light);
    transition: all var(--transition-fast);
    text-transform: capitalize;
  }
  .article-tag:hover {
    background: var(--accent-soft);
    border-color: var(--accent-light);
    color: var(--accent-dark);
  }

  /* Share inline */
  .share-inline {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin: var(--space-lg) 0;
  }
  .share-inline-label {
    font-family: var(--font-ui);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .share-inline-btns { display: flex; gap: var(--space-sm); }
  .share-inline-btn {
    font-family: var(--font-ui);
    font-size: 0.8rem;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: var(--radius-xl);
    border: 1.5px solid var(--border);
    background: var(--bg-card);
    color: var(--text-secondary);
    text-decoration: none;
    transition: all var(--transition-fast);
  }
  .share-inline-btn:hover { background: var(--accent); border-color: var(--accent); color: #fff; }

  /* Sidebar */
  .sidebar-related { }
  .sidebar-title {
    font-family: var(--font-ui);
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-bottom: var(--space-md);
  }
  .sidebar-quiz-cta {
    background: var(--accent-soft);
    border: 1px solid var(--accent-light);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
  }
  .sidebar-quiz-cta h4 {
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: var(--space-sm);
  }
  .sidebar-quiz-cta p {
    font-family: var(--font-ui);
    font-size: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: var(--space-md);
  }
  .sidebar-quiz-btn {
    display: block;
    background: var(--accent);
    color: #fff;
    font-family: var(--font-ui);
    font-size: 0.875rem;
    font-weight: 600;
    padding: 10px 18px;
    border-radius: var(--radius-xl);
    text-decoration: none;
    text-align: center;
    transition: background var(--transition-fast);
    min-height: var(--tap-target-min);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sidebar-quiz-btn:hover { background: var(--accent-dark); color: #fff; }

  /* Related */
  .article-related {
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-light);
    padding: var(--space-2xl) 0;
  }
  .related-title {
    font-family: var(--font-heading);
    font-size: 1.6rem;
    font-weight: 700;
    margin-bottom: var(--space-xl);
  }
  .related-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-xl);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .article-layout { grid-template-columns: 1fr; }
    .article-sidebar { position: static; display: none; }
  }
  @media (max-width: 768px) {
    .related-grid { grid-template-columns: 1fr 1fr; }
    .article-title { font-size: 1.8rem; }
  }
  @media (max-width: 480px) {
    .related-grid { grid-template-columns: 1fr; }
    .breadcrumb { display: none; }
  }
`;
