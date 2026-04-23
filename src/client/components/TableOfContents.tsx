import { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TOCItem[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0% -70% 0%', threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav className="toc" aria-label="Table of contents">
      <h4 className="toc-title">In this article</h4>
      <ul className="toc-list">
        {headings.map(({ id, text, level }) => (
          <li key={id} className={`toc-item toc-level-${level}${activeId === id ? ' active' : ''}`}>
            <a href={`#${id}`} className="toc-link">
              {text}
            </a>
          </li>
        ))}
      </ul>
      <style>{`
        .toc {
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-lg) var(--space-xl);
          margin: var(--space-xl) 0;
        }
        .toc-title {
          font-family: var(--font-ui);
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: var(--space-md);
        }
        .toc-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .toc-item { padding: 0; margin: 0; }
        .toc-level-3 { padding-left: var(--space-md); }
        .toc-link {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-decoration: none;
          display: block;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          border-left: 2px solid transparent;
          transition: color var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
          line-height: 1.4;
        }
        .toc-link:hover {
          color: var(--accent-dark);
          background: var(--accent-soft);
          border-left-color: var(--accent);
        }
        .toc-item.active .toc-link {
          color: var(--accent-dark);
          font-weight: 600;
          border-left-color: var(--accent);
          background: var(--accent-soft);
        }
      `}</style>
    </nav>
  );
}
