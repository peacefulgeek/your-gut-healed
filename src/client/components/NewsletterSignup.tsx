import { useState } from 'react';

interface NewsletterSignupProps {
  variant?: 'inline' | 'banner' | 'sidebar';
  title?: string;
  subtitle?: string;
}

export function NewsletterSignup({
  variant = 'inline',
  title = 'Your gut has a story. Let\'s read it together.',
  subtitle = 'Weekly insights on gut healing, the gut-brain connection, and the emotional roots of digestive pain. No spam. Unsubscribe anytime.'
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('You\'re in. Check your inbox for a welcome note.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (variant === 'sidebar') {
    return (
      <aside className="newsletter-sidebar">
        <div className="newsletter-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="var(--accent-soft)"/>
            <path d="M8 11C8 10.4477 8.44772 10 9 10H23C23.5523 10 24 10.4477 24 11V21C24 21.5523 23.5523 22 23 22H9C8.44772 22 8 21.5523 8 21V11Z" stroke="var(--accent)" strokeWidth="1.5"/>
            <path d="M8 11L16 17L24 11" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h4 className="newsletter-title-sm">{title}</h4>
        <p className="newsletter-subtitle-sm">{subtitle}</p>
        {status === 'success' ? (
          <p className="newsletter-success">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="newsletter-form-sm">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="newsletter-input"
              aria-label="Email address"
              disabled={status === 'loading'}
            />
            <button type="submit" className="newsletter-btn" disabled={status === 'loading'}>
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
            {status === 'error' && <p className="newsletter-error">{message}</p>}
          </form>
        )}
        <style>{sidebarStyles}</style>
      </aside>
    );
  }

  if (variant === 'banner') {
    return (
      <section className="newsletter-banner">
        <div className="newsletter-banner-inner container">
          <div className="newsletter-banner-text">
            <h2 className="newsletter-banner-title">{title}</h2>
            <p className="newsletter-banner-subtitle">{subtitle}</p>
          </div>
          {status === 'success' ? (
            <p className="newsletter-success-banner">{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form-banner">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="newsletter-input-banner"
                aria-label="Email address"
                disabled={status === 'loading'}
              />
              <button type="submit" className="newsletter-btn-banner" disabled={status === 'loading'}>
                {status === 'loading' ? 'Subscribing...' : 'Get weekly insights'}
              </button>
              {status === 'error' && <p className="newsletter-error">{message}</p>}
            </form>
          )}
        </div>
        <style>{bannerStyles}</style>
      </section>
    );
  }

  // inline (default)
  return (
    <div className="newsletter-inline">
      <h3 className="newsletter-inline-title">{title}</h3>
      <p className="newsletter-inline-subtitle">{subtitle}</p>
      {status === 'success' ? (
        <p className="newsletter-success">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="newsletter-form-inline">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="newsletter-input"
            aria-label="Email address"
            disabled={status === 'loading'}
          />
          <button type="submit" className="newsletter-btn" disabled={status === 'loading'}>
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
          {status === 'error' && <p className="newsletter-error">{message}</p>}
        </form>
      )}
      <style>{inlineStyles}</style>
    </div>
  );
}

const sharedInputStyles = `
  .newsletter-input, .newsletter-input-banner {
    font-family: var(--font-ui);
    font-size: 0.9rem;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 10px 18px;
    background: var(--bg-card);
    color: var(--text-primary);
    outline: none;
    transition: border-color var(--transition-fast);
    width: 100%;
  }
  .newsletter-input:focus, .newsletter-input-banner:focus {
    border-color: var(--accent);
  }
  .newsletter-btn, .newsletter-btn-banner {
    font-family: var(--font-ui);
    font-size: 0.9rem;
    font-weight: 600;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-xl);
    padding: 10px 22px;
    cursor: pointer;
    transition: background var(--transition-fast);
    white-space: nowrap;
    min-height: var(--tap-target-min);
  }
  .newsletter-btn:hover, .newsletter-btn-banner:hover { background: var(--accent-dark); }
  .newsletter-btn:disabled, .newsletter-btn-banner:disabled { opacity: 0.6; cursor: not-allowed; }
  .newsletter-success, .newsletter-success-banner {
    font-family: var(--font-ui);
    font-size: 0.9rem;
    color: var(--accent-dark);
    font-weight: 500;
    padding: var(--space-md);
    background: var(--accent-soft);
    border-radius: var(--radius-md);
  }
  .newsletter-error {
    font-family: var(--font-ui);
    font-size: 0.8rem;
    color: #c0392b;
    margin-top: var(--space-sm);
  }
`;

const inlineStyles = sharedInputStyles + `
  .newsletter-inline {
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-xl);
    padding: var(--space-xl) var(--space-2xl);
    text-align: center;
    margin: var(--space-2xl) 0;
  }
  .newsletter-inline-title {
    font-family: var(--font-heading);
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: var(--space-sm);
  }
  .newsletter-inline-subtitle {
    font-family: var(--font-ui);
    font-size: 0.9rem;
    color: var(--text-secondary);
    max-width: 480px;
    margin: 0 auto var(--space-lg);
    line-height: 1.6;
  }
  .newsletter-form-inline {
    display: flex;
    gap: var(--space-sm);
    max-width: 420px;
    margin: 0 auto;
  }
  @media (max-width: 480px) {
    .newsletter-form-inline { flex-direction: column; }
    .newsletter-inline { padding: var(--space-xl) var(--space-lg); }
  }
`;

const sidebarStyles = sharedInputStyles + `
  .newsletter-sidebar {
    background: var(--accent-soft);
    border: 1px solid var(--accent-light);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
  }
  .newsletter-icon { margin-bottom: var(--space-sm); }
  .newsletter-title-sm {
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: var(--space-sm);
    line-height: 1.3;
  }
  .newsletter-subtitle-sm {
    font-family: var(--font-ui);
    font-size: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: var(--space-md);
  }
  .newsletter-form-sm {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
`;

const bannerStyles = sharedInputStyles + `
  .newsletter-banner {
    background: linear-gradient(135deg, var(--accent-soft) 0%, var(--accent-warm-soft) 100%);
    border-top: 1px solid var(--border-light);
    border-bottom: 1px solid var(--border-light);
    padding: var(--space-2xl) 0;
  }
  .newsletter-banner-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2xl);
    align-items: center;
  }
  .newsletter-banner-title {
    font-family: var(--font-heading);
    font-size: 1.6rem;
    font-weight: 700;
    margin-bottom: var(--space-sm);
  }
  .newsletter-banner-subtitle {
    font-family: var(--font-ui);
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }
  .newsletter-form-banner {
    display: flex;
    gap: var(--space-sm);
  }
  .newsletter-success-banner {
    font-family: var(--font-ui);
    font-size: 1rem;
    color: var(--accent-dark);
    font-weight: 500;
  }
  @media (max-width: 768px) {
    .newsletter-banner-inner { grid-template-columns: 1fr; gap: var(--space-lg); }
    .newsletter-form-banner { flex-direction: column; }
  }
`;
