import { Link } from 'react-router-dom';

interface ArticleCardProps {
  slug: string;
  title: string;
  metaDescription?: string;
  imageUrl?: string;
  imageAlt?: string;
  category?: string;
  publishedAt?: string;
  readingTime?: number;
  variant?: 'default' | 'featured' | 'compact';
}

const PLACEHOLDER = 'https://yourgut-healed.b-cdn.net/images/placeholder-gut.webp';

const CATEGORY_LABELS: Record<string, string> = {
  'ibs': 'IBS',
  'gut-brain': 'Gut-Brain',
  'sibo': 'SIBO',
  'diet': 'Diet',
  'leaky-gut': 'Leaky Gut',
  'emotional-roots': 'Emotional Roots',
  'tcm': 'TCM',
  'probiotics': 'Probiotics',
  'testing': 'Testing',
  'bloating': 'Bloating',
  'vagus-nerve': 'Vagus Nerve',
  'digestive-enzymes': 'Enzymes',
  'acid-reflux': 'Acid Reflux',
  'microbiome': 'Microbiome',
  'ayurveda': 'Ayurveda',
  'herbal': 'Herbal',
  'gut-skin': 'Gut & Skin',
  'candida': 'Candida',
  'gut-repair': 'Gut Repair',
  'functional-medicine': 'Functional Med',
  'gut-health': 'Gut Health',
  'default': 'Gut Health'
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch {
    return '';
  }
}

export function ArticleCard({
  slug, title, metaDescription, imageUrl, imageAlt, category,
  publishedAt, readingTime, variant = 'default'
}: ArticleCardProps) {
  const img = imageUrl || PLACEHOLDER;
  const alt = imageAlt || title;
  const label = CATEGORY_LABELS[category || 'default'] || 'Gut Health';

  if (variant === 'compact') {
    return (
      <article className="article-card-compact">
        <Link to={`/articles/${slug}`} className="card-compact-link">
          <div className="card-compact-img">
            <img src={img} alt={alt} loading="lazy" width="80" height="80"
              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
          </div>
          <div className="card-compact-body">
            <span className="card-category">{label}</span>
            <h3 className="card-compact-title">{title}</h3>
            {readingTime && <span className="card-meta">{readingTime} min read</span>}
          </div>
        </Link>
        <style>{compactStyles}</style>
      </article>
    );
  }

  if (variant === 'featured') {
    return (
      <article className="article-card-featured">
        <Link to={`/articles/${slug}`} className="card-featured-link">
          <div className="card-featured-img">
            <img src={img} alt={alt} loading="eager" width="800" height="450"
              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
            <span className="card-category card-category-overlay">{label}</span>
          </div>
          <div className="card-featured-body">
            <h2 className="card-featured-title">{title}</h2>
            {metaDescription && <p className="card-featured-desc">{metaDescription}</p>}
            <div className="card-meta-row">
              {publishedAt && <span className="card-meta">{formatDate(publishedAt)}</span>}
              {readingTime && <span className="card-meta">{readingTime} min read</span>}
            </div>
            <span className="card-read-more">Read article &rarr;</span>
          </div>
        </Link>
        <style>{featuredStyles}</style>
      </article>
    );
  }

  return (
    <article className="article-card">
      <Link to={`/articles/${slug}`} className="card-link">
        <div className="card-img-wrap">
          <img src={img} alt={alt} loading="lazy" width="400" height="225"
            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} />
          <span className="card-category">{label}</span>
        </div>
        <div className="card-body">
          <h3 className="card-title">{title}</h3>
          {metaDescription && <p className="card-desc">{metaDescription}</p>}
          <div className="card-meta-row">
            {publishedAt && <span className="card-meta">{formatDate(publishedAt)}</span>}
            {readingTime && <span className="card-meta">{readingTime} min read</span>}
          </div>
        </div>
      </Link>
      <style>{defaultStyles}</style>
    </article>
  );
}

const defaultStyles = `
  .article-card {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border-light);
    transition: transform var(--transition-base), box-shadow var(--transition-base);
  }
  .article-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }
  .card-link {
    display: block;
    text-decoration: none;
    color: inherit;
  }
  .card-img-wrap {
    position: relative;
    aspect-ratio: 16/9;
    overflow: hidden;
    background: var(--bg-secondary);
  }
  .card-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 400ms ease;
  }
  .article-card:hover .card-img-wrap img {
    transform: scale(1.04);
  }
  .card-category {
    position: absolute;
    top: 12px;
    left: 12px;
    background: var(--accent);
    color: #fff;
    font-family: var(--font-ui);
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 3px 8px;
    border-radius: var(--radius-xl);
  }
  .card-body {
    padding: var(--space-lg);
  }
  .card-title {
    font-family: var(--font-heading);
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.35;
    margin-bottom: var(--space-sm);
  }
  .card-desc {
    font-family: var(--font-ui);
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: var(--space-sm);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-meta-row {
    display: flex;
    gap: var(--space-md);
    align-items: center;
  }
  .card-meta {
    font-family: var(--font-ui);
    font-size: 0.75rem;
    color: var(--text-muted);
  }
`;

const featuredStyles = `
  .article-card-featured {
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-sm);
    transition: transform var(--transition-base), box-shadow var(--transition-base);
  }
  .article-card-featured:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  .card-featured-link {
    display: block;
    text-decoration: none;
    color: inherit;
  }
  .card-featured-img {
    position: relative;
    aspect-ratio: 16/9;
    overflow: hidden;
    background: var(--bg-secondary);
  }
  .card-featured-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 500ms ease;
  }
  .article-card-featured:hover .card-featured-img img {
    transform: scale(1.03);
  }
  .card-category-overlay {
    position: absolute;
    top: 16px;
    left: 16px;
    background: var(--accent);
    color: #fff;
    font-family: var(--font-ui);
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 4px 10px;
    border-radius: var(--radius-xl);
  }
  .card-featured-body {
    padding: var(--space-xl);
  }
  .card-featured-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
    margin-bottom: var(--space-md);
  }
  .card-featured-desc {
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: var(--space-md);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-meta-row {
    display: flex;
    gap: var(--space-md);
    align-items: center;
    margin-bottom: var(--space-md);
  }
  .card-meta {
    font-family: var(--font-ui);
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  .card-read-more {
    font-family: var(--font-ui);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--accent-dark);
    display: inline-block;
  }
`;

const compactStyles = `
  .article-card-compact {
    border-bottom: 1px solid var(--border-light);
    padding: var(--space-md) 0;
  }
  .article-card-compact:last-child { border-bottom: none; }
  .card-compact-link {
    display: flex;
    gap: var(--space-md);
    text-decoration: none;
    color: inherit;
    align-items: flex-start;
  }
  .card-compact-img {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--bg-secondary);
  }
  .card-compact-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .card-compact-body {
    flex: 1;
    min-width: 0;
  }
  .card-category {
    display: inline-block;
    background: var(--accent-soft);
    color: var(--accent-dark);
    font-family: var(--font-ui);
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 2px 7px;
    border-radius: var(--radius-xl);
    margin-bottom: 4px;
  }
  .card-compact-title {
    font-family: var(--font-heading);
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.35;
    margin-bottom: 4px;
  }
  .card-compact-link:hover .card-compact-title {
    color: var(--accent-dark);
  }
  .card-meta {
    font-family: var(--font-ui);
    font-size: 0.75rem;
    color: var(--text-muted);
  }
`;
