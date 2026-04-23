import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';

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
  { key: '', label: 'All' },
  { key: 'ibs', label: 'IBS' },
  { key: 'gut-brain', label: 'Gut-Brain' },
  { key: 'microbiome', label: 'Microbiome' },
  { key: 'emotional-roots', label: 'Emotional Roots' },
  { key: 'diet', label: 'Diet' },
  { key: 'gut-repair', label: 'Gut Repair' },
  { key: 'sibo', label: 'SIBO' },
  { key: 'probiotics', label: 'Probiotics' },
  { key: 'herbal', label: 'Herbal' },
  { key: 'vagus-nerve', label: 'Vagus Nerve' },
];

const PAGE_SIZE = 12;

export function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('q') || '';

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String((page - 1) * PAGE_SIZE),
      sort: 'recent'
    });
    if (category) params.set('category', category);
    if (search) params.set('q', search);

    fetch(`/api/articles?${params}`)
      .then(r => r.json())
      .then(data => {
        setArticles(data.articles || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, search, page]);

  function handleCategoryChange(cat: string) {
    const p = new URLSearchParams(searchParams);
    if (cat) p.set('category', cat);
    else p.delete('category');
    p.delete('q');
    setSearchParams(p);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim();
    const p = new URLSearchParams(searchParams);
    if (q) p.set('q', q);
    else p.delete('q');
    setSearchParams(p);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="articles-page">
      <div className="articles-hero">
        <div className="container">
          <h1 className="articles-title">All Articles</h1>
          <p className="articles-subtitle">
            {total > 0 ? `${total} articles on gut healing, the gut-brain connection, and beyond.` : 'Exploring the gut from every angle.'}
          </p>
          <form onSubmit={handleSearch} className="search-form" role="search">
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Search articles..."
              className="search-input"
              aria-label="Search articles"
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div className="container articles-layout">
        <div className="category-filter" role="navigation" aria-label="Filter by category">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`filter-btn${category === cat.key ? ' active' : ''}`}
              onClick={() => handleCategoryChange(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="articles-grid-page">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="article-skeleton" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="no-results">
            {search || category ? (
              <p>No articles found{search ? ` for "${search}"` : ''}. Try a different search or category.</p>
            ) : (
              <div className="first-launch-state">
                <div className="first-launch-icon" aria-hidden="true">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="32" fill="var(--accent-soft)"/>
                    <path d="M32 16C32 16 20 24 20 34C20 40.627 25.373 46 32 46C38.627 46 44 40.627 44 34C44 24 32 16 32 16Z" fill="var(--accent)" opacity="0.25"/>
                    <path d="M32 16C32 16 20 24 20 34C20 40.627 25.373 46 32 46" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M32 16C32 16 44 24 44 34C44 40.627 38.627 46 32 46" stroke="var(--accent-dark)" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M32 46V28" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="first-launch-title">Articles are being prepared</h3>
                <p className="first-launch-desc">The Quiet Gut library is seeding now. Thirty articles on IBS, the gut-brain connection, SIBO, and the emotional roots of digestive pain will be live shortly.</p>
                <p className="first-launch-desc">Check back in a few minutes, or take the <a href="/gut-health-quiz">Gut Health Quiz</a> while you wait.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="articles-grid-page">
              {articles.map(a => (
                <ArticleCard
                  key={a.slug}
                  slug={a.slug}
                  title={a.title}
                  metaDescription={a.meta_description}
                  imageUrl={a.image_url}
                  imageAlt={a.image_alt}
                  category={a.category}
                  publishedAt={a.published_at}
                  readingTime={a.reading_time}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  &larr; Previous
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  Next &rarr;
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      <style>{`
        .articles-page { padding-bottom: var(--space-3xl); }
        .articles-hero {
          background: linear-gradient(160deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
          padding: var(--space-2xl) 0 var(--space-xl);
          border-bottom: 1px solid var(--border-light);
          margin-bottom: var(--space-xl);
        }
        .articles-title {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: var(--space-sm);
        }
        .articles-subtitle {
          font-family: var(--font-ui);
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-lg);
        }
        .search-form {
          display: flex;
          max-width: 480px;
          gap: 0;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          background: var(--bg-card);
        }
        .search-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 10px 18px;
          font-family: var(--font-ui);
          font-size: 0.9rem;
          background: transparent;
          color: var(--text-primary);
        }
        .search-btn {
          background: var(--accent);
          border: none;
          color: #fff;
          padding: 0 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: background var(--transition-fast);
        }
        .search-btn:hover { background: var(--accent-dark); }
        .articles-layout { padding-top: var(--space-md); }
        .category-filter {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
          margin-bottom: var(--space-xl);
        }
        .filter-btn {
          font-family: var(--font-ui);
          font-size: 0.85rem;
          font-weight: 500;
          padding: 6px 16px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-xl);
          background: var(--bg-card);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          min-height: var(--tap-target-min);
        }
        .filter-btn:hover {
          border-color: var(--accent);
          color: var(--accent-dark);
          background: var(--accent-soft);
        }
        .filter-btn.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
        }
        .articles-grid-page {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-xl);
          margin-bottom: var(--space-xl);
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
        .no-results {
          text-align: center;
          padding: var(--space-3xl);
          font-family: var(--font-ui);
          color: var(--text-muted);
        }
        .first-launch-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-lg);
          max-width: 480px;
          margin: 0 auto;
          padding: var(--space-2xl) 0;
        }
        .first-launch-icon { flex-shrink: 0; }
        .first-launch-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .first-launch-desc {
          font-family: var(--font-ui);
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-lg);
          padding: var(--space-xl) 0;
        }
        .page-btn {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          font-weight: 600;
          padding: 8px 20px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-xl);
          background: var(--bg-card);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          min-height: var(--tap-target-min);
        }
        .page-btn:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent-dark);
        }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .page-info {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        @media (max-width: 768px) {
          .articles-grid-page { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .articles-grid-page { grid-template-columns: 1fr; }
          .articles-title { font-size: 1.8rem; }
        }
      `}</style>
    </div>
  );
}
