import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export function Header() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="site-header">
      <div className="header-inner container">
        <Link to="/" className="site-logo" aria-label="Your Gut Healed - Home">
          <span className="logo-leaf" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2C14 2 4 8 4 16C4 21.5228 8.47715 26 14 26C19.5228 26 24 21.5228 24 16C24 8 14 2 14 2Z" fill="#7A8B6F" opacity="0.3"/>
              <path d="M14 2C14 2 4 8 4 16C4 21.5228 8.47715 26 14 26" stroke="#7A8B6F" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M14 2C14 2 24 8 24 16C24 21.5228 19.5228 26 14 26" stroke="#5A6B50" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M14 26V10" stroke="#7A8B6F" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M14 14L10 10" stroke="#A8B89D" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M14 18L18 14" stroke="#A8B89D" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="logo-text">
            <span className="logo-title">Your Gut Healed</span>
            <span className="logo-tagline">The Quiet Gut</span>
          </span>
        </Link>

        <nav className="header-nav" aria-label="Main navigation">
          <Link to="/" className={`nav-link${isActive('/') ? ' active' : ''}`}>Home</Link>
          <Link to="/about" className={`nav-link${isActive('/about') ? ' active' : ''}`}>About</Link>
          <Link to="/articles" className={`nav-link${isActive('/articles') ? ' active' : ''}`}>Articles</Link>
          <Link to="/gut-healing-toolkit" className={`nav-link${isActive('/gut-healing-toolkit') ? ' active' : ''}`}>Toolkit</Link>
          <Link to="/gut-health-quiz" className="nav-link nav-cta">Take the Quiz</Link>
        </nav>

        <button
          className={`mobile-menu-btn${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-nav" role="navigation" aria-label="Mobile navigation">
          <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/articles" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Articles</Link>
          <Link to="/gut-healing-toolkit" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Gut Healing Toolkit</Link>
          <Link to="/gut-health-quiz" className="mobile-nav-link mobile-nav-cta" onClick={() => setMenuOpen(false)}>Take the Gut Health Quiz</Link>
        </div>
      )}

      <style>{`
        .site-header {
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-light);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          gap: var(--space-lg);
        }
        .site-logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          text-decoration: none;
          flex-shrink: 0;
        }
        .site-logo:hover { opacity: 0.85; }
        .logo-leaf { display: flex; align-items: center; }
        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .logo-title {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .logo-tagline {
          font-family: var(--font-ui);
          font-size: 0.65rem;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .header-nav {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        .nav-link {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          transition: color var(--transition-fast), background var(--transition-fast);
          white-space: nowrap;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--text-primary);
          background: var(--accent-soft);
        }
        .nav-cta {
          background: var(--accent);
          color: #fff !important;
          padding: 8px 16px;
          border-radius: var(--radius-xl);
          font-weight: 600;
        }
        .nav-cta:hover {
          background: var(--accent-dark) !important;
          color: #fff !important;
        }
        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: var(--radius-sm);
        }
        .mobile-menu-btn span {
          display: block;
          width: 22px;
          height: 2px;
          background: var(--text-primary);
          border-radius: 2px;
          transition: transform var(--transition-base), opacity var(--transition-base);
        }
        .mobile-menu-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .mobile-menu-btn.open span:nth-child(2) { opacity: 0; }
        .mobile-menu-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .mobile-nav {
          background: var(--bg-primary);
          border-top: 1px solid var(--border-light);
          padding: var(--space-md) var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        .mobile-nav-link {
          font-family: var(--font-ui);
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 12px var(--space-md);
          border-radius: var(--radius-md);
          transition: background var(--transition-fast), color var(--transition-fast);
        }
        .mobile-nav-link:hover { background: var(--accent-soft); color: var(--text-primary); }
        .mobile-nav-cta {
          background: var(--accent);
          color: #fff !important;
          text-align: center;
          margin-top: var(--space-sm);
          font-weight: 600;
        }
        .mobile-nav-cta:hover { background: var(--accent-dark) !important; }
        @media (max-width: 768px) {
          .header-nav { display: none; }
          .mobile-menu-btn { display: flex; }
        }
      `}</style>
    </header>
  );
}
