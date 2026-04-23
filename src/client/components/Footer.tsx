import { Link } from 'react-router-dom';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">Your Gut Healed</Link>
          <p className="footer-tagline">
            Your gut isn't just digesting food. It's digesting your life.
          </p>
          <p className="footer-author">
            Written by <a href="https://theoraclelover.com" target="_blank" rel="noopener noreferrer">The Oracle Lover</a>
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Explore</h4>
            <Link to="/">Home</Link>
            <Link to="/articles">All Articles</Link>
            <Link to="/gut-healing-toolkit">Gut Healing Toolkit</Link>
            <Link to="/gut-health-quiz">Gut Health Quiz</Link>
          </div>
          <div className="footer-col">
            <h4>About</h4>
            <Link to="/about">About The Oracle Lover</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <a href="https://theoraclelover.com" target="_blank" rel="noopener noreferrer">The Oracle Lover</a>
          </div>
          <div className="footer-col">
            <h4>Topics</h4>
            <Link to="/articles?category=ibs">IBS</Link>
            <Link to="/articles?category=gut-brain">Gut-Brain Connection</Link>
            <Link to="/articles?category=microbiome">Microbiome</Link>
            <Link to="/articles?category=emotional-roots">Emotional Roots</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p className="footer-disclaimer">
            <strong>Health Disclaimer:</strong> This site is for educational purposes only and is not intended as medical advice.
            Digestive symptoms can indicate serious conditions. Always consult your healthcare provider before starting any new supplement or dietary protocol.
          </p>
          <p className="footer-affiliate">
            As an Amazon Associate I earn from qualifying purchases.
          </p>
          <p className="footer-copy">
            &copy; {year} Your Gut Healed. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        .site-footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          margin-top: var(--space-3xl);
        }
        .footer-inner {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: var(--space-2xl);
          padding-top: var(--space-2xl);
          padding-bottom: var(--space-2xl);
        }
        .footer-logo {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          text-decoration: none;
          display: block;
          margin-bottom: var(--space-sm);
        }
        .footer-tagline {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-style: italic;
          line-height: 1.5;
          margin-bottom: var(--space-sm);
        }
        .footer-author {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .footer-author a {
          color: var(--accent-dark);
          font-weight: 500;
        }
        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-xl);
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        .footer-col h4 {
          font-family: var(--font-ui);
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: var(--space-xs);
        }
        .footer-col a {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }
        .footer-col a:hover { color: var(--accent-dark); }
        .footer-bottom {
          border-top: 1px solid var(--border-light);
          padding: var(--space-lg) 0;
        }
        .footer-bottom .container {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        .footer-disclaimer {
          font-family: var(--font-ui);
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.6;
          max-width: 800px;
        }
        .footer-affiliate {
          font-family: var(--font-ui);
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .footer-copy {
          font-family: var(--font-ui);
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        @media (max-width: 768px) {
          .footer-inner {
            grid-template-columns: 1fr;
            gap: var(--space-xl);
          }
          .footer-links {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-lg);
          }
        }
        @media (max-width: 480px) {
          .footer-links {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
