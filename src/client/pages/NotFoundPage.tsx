import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="container">
        <div className="not-found-inner">
          <span className="not-found-code">404</span>
          <h1 className="not-found-title">This page got lost in the gut.</h1>
          <p className="not-found-desc">
            The page you're looking for doesn't exist. It may have moved, or the URL might be wrong.
          </p>
          <div className="not-found-actions">
            <Link to="/" className="btn-primary">Go Home</Link>
            <Link to="/articles" className="btn-secondary">Browse Articles</Link>
          </div>
        </div>
      </div>
      <style>{`
        .not-found {
          padding: var(--space-3xl) 0;
          text-align: center;
        }
        .not-found-inner {
          max-width: 480px;
          margin: 0 auto;
        }
        .not-found-code {
          display: block;
          font-family: var(--font-heading);
          font-size: 6rem;
          font-weight: 700;
          color: var(--accent-light);
          line-height: 1;
          margin-bottom: var(--space-md);
        }
        .not-found-title {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: var(--space-md);
        }
        .not-found-desc {
          font-family: var(--font-ui);
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: var(--space-xl);
        }
        .not-found-actions {
          display: flex;
          gap: var(--space-md);
          justify-content: center;
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
          transition: background var(--transition-fast);
          min-height: var(--tap-target-min);
        }
        .btn-primary:hover { background: var(--accent-dark); color: #fff; }
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
          transition: all var(--transition-fast);
          min-height: var(--tap-target-min);
        }
        .btn-secondary:hover { border-color: var(--accent); background: var(--accent-soft); }
      `}</style>
    </div>
  );
}
