interface ProductCardProps {
  asin: string;
  name: string;
  category?: string;
  description?: string;
}

const TAG = 'spankyspinola-20';

function buildAmazonUrl(asin: string) {
  return `https://www.amazon.com/dp/${asin}?tag=${TAG}`;
}

export function ProductCard({ asin, name, category, description }: ProductCardProps) {
  const url = buildAmazonUrl(asin);
  const imgUrl = `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=${TAG}`;

  return (
    <div className="product-card">
      <div className="product-img-wrap">
        <a href={url} target="_blank" rel="nofollow sponsored noopener" aria-label={`View ${name} on Amazon`}>
          <img
            src={imgUrl}
            alt={name}
            loading="lazy"
            width="120"
            height="120"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </a>
      </div>
      <div className="product-body">
        {category && <span className="product-category">{category}</span>}
        <h4 className="product-name">
          <a href={url} target="_blank" rel="nofollow sponsored noopener">{name}</a>
        </h4>
        {description && <p className="product-desc">{description}</p>}
        <a
          href={url}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="product-btn"
        >
          View on Amazon
        </a>
        <p className="product-disclosure">Paid link. As an Amazon Associate I earn from qualifying purchases.</p>
      </div>
      <style>{`
        .product-card {
          display: flex;
          gap: var(--space-lg);
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          margin: var(--space-xl) 0;
          align-items: flex-start;
        }
        .product-img-wrap {
          flex-shrink: 0;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .product-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .product-body { flex: 1; min-width: 0; }
        .product-category {
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
          margin-bottom: var(--space-sm);
        }
        .product-name {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: var(--space-sm);
          line-height: 1.3;
        }
        .product-name a {
          color: var(--text-primary);
          text-decoration: none;
        }
        .product-name a:hover { color: var(--accent-dark); }
        .product-desc {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: var(--space-md);
        }
        .product-btn {
          display: inline-block;
          background: var(--accent-warm);
          color: #fff;
          font-family: var(--font-ui);
          font-size: 0.875rem;
          font-weight: 600;
          padding: 8px 18px;
          border-radius: var(--radius-xl);
          text-decoration: none;
          transition: background var(--transition-fast);
          margin-bottom: var(--space-sm);
        }
        .product-btn:hover { background: #a8784e; color: #fff; }
        .product-disclosure {
          font-family: var(--font-ui);
          font-size: 0.7rem;
          color: var(--text-muted);
          margin: 0;
        }
        @media (max-width: 480px) {
          .product-card { flex-direction: column; }
          .product-img-wrap { width: 80px; height: 80px; }
        }
      `}</style>
    </div>
  );
}
