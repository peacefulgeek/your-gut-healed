import { Link } from 'react-router-dom';
import { NewsletterSignup } from '../components/NewsletterSignup';

export function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <span className="about-eyebrow">About</span>
          <h1 className="about-title">Written by someone who has lived it.</h1>
        </div>
      </div>

      <div className="about-content container">
        <div className="about-layout">
          <div className="about-main prose">
            <p className="about-lead">
              I'm The Oracle Lover. I spent years navigating IBS, SIBO, and the kind of digestive pain
              that makes you cancel plans, eat the same five foods, and quietly wonder if your body
              will ever feel safe again.
            </p>

            <h2>Why this site exists</h2>
            <p>
              When I was in the thick of it, I searched for information that was honest, evidence-based,
              and written by someone who actually understood what it felt like to live in a body that
              wouldn't cooperate. I found fragments of that, but nothing complete.
            </p>
            <p>
              Most gut health content falls into one of two camps: clinical and cold, or woo-adjacent
              and vague. I wanted something in between. Something that took the science seriously,
              honored the emotional dimension, and didn't talk down to you.
            </p>
            <p>
              That's what Your Gut Healed is. It's the site I wish had existed when I was searching
              for answers at 2am.
            </p>

            <h2>What you'll find here</h2>
            <p>
              Every article on this site is written to the standard I call "the 2am test": if someone
              is lying awake with gut pain, searching for answers, does this article give them something
              real? Something they can use? Something that makes them feel less alone?
            </p>
            <p>
              You'll find writing on IBS, SIBO, the gut-brain connection, the microbiome, the emotional
              roots of digestive pain, traditional Chinese medicine approaches, functional medicine testing,
              and the practical day-to-day of living with a gut that needs extra care.
            </p>
            <p>
              You'll also find honest product recommendations. I only recommend things I've researched
              thoroughly or used myself. When I link to Amazon, I earn a small commission at no extra
              cost to you. That's how this site stays free.
            </p>

            <h2>A note on the emotional dimension</h2>
            <p>
              One of the things I care most about is the emotional roots of gut symptoms. The research
              on the gut-brain axis is extraordinary, and it points to something that traditional medicine
              has been slow to integrate: your gut is not just a digestive organ. It's a nervous system
              organ. It holds stress, trauma, grief, and fear in ways that are physiologically real.
            </p>
            <p>
              This doesn't mean your symptoms are "just stress." It means healing sometimes requires
              working at more than one level at once.
            </p>

            <h2>What this site is not</h2>
            <p>
              This site is not medical advice. I'm not a doctor. I'm a writer who has done a lot of
              research and lived a lot of this. Everything here is educational. If you're experiencing
              significant digestive symptoms, please see a healthcare provider. Some gut symptoms
              require medical evaluation.
            </p>

            <blockquote>
              "The gut is the seat of all feeling. Courage and fear both live there."
              <cite>Wentworth Dillon</cite>
            </blockquote>

            <p>
              I hope something here helps you. I hope you find your way to a gut that feels quiet,
              comfortable, and yours.
            </p>

            <p>
              With warmth,<br />
              <strong>The Oracle Lover</strong><br />
              <a href="https://theoraclelover.com" target="_blank" rel="noopener noreferrer">theoraclelover.com</a>
            </p>
          </div>

          <aside className="about-sidebar">
            <div className="about-sidebar-card">
              <h3>Start here</h3>
              <ul>
                <li><Link to="/gut-health-quiz">Take the Gut Health Quiz</Link></li>
                <li><Link to="/gut-healing-toolkit">The Gut Healing Toolkit</Link></li>
                <li><Link to="/articles?category=ibs">IBS Articles</Link></li>
                <li><Link to="/articles?category=gut-brain">Gut-Brain Connection</Link></li>
                <li><Link to="/articles?category=emotional-roots">Emotional Roots</Link></li>
              </ul>
            </div>
            <NewsletterSignup variant="sidebar" />
          </aside>
        </div>
      </div>

      <style>{`
        .about-page { padding-bottom: var(--space-3xl); }
        .about-hero {
          background: linear-gradient(160deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
          padding: var(--space-2xl) 0 var(--space-xl);
          border-bottom: 1px solid var(--border-light);
          margin-bottom: var(--space-2xl);
        }
        .about-eyebrow {
          display: inline-block;
          font-family: var(--font-ui);
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--accent);
          margin-bottom: var(--space-sm);
        }
        .about-title {
          font-family: var(--font-heading);
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          font-weight: 700;
          max-width: 600px;
        }
        .about-content { }
        .about-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: var(--space-2xl);
          align-items: start;
        }
        .about-main { max-width: var(--max-content-width); }
        .about-lead {
          font-size: 1.15rem;
          font-style: italic;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: var(--space-xl);
        }
        .prose h2 {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 700;
          margin-top: 2em;
          margin-bottom: 0.75em;
          padding-top: 0.5em;
          border-top: 1px solid var(--border-light);
        }
        .prose p { margin-bottom: 1.4em; line-height: 1.8; }
        .prose blockquote {
          border-left: 3px solid var(--accent);
          padding: var(--space-md) var(--space-lg);
          margin: var(--space-xl) 0;
          background: var(--bg-secondary);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          font-style: italic;
          color: var(--text-secondary);
        }
        .prose blockquote cite {
          display: block;
          font-style: normal;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: var(--space-sm);
        }
        .about-sidebar {
          position: sticky;
          top: 88px;
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }
        .about-sidebar-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
        }
        .about-sidebar-card h3 {
          font-family: var(--font-ui);
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: var(--space-md);
        }
        .about-sidebar-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        .about-sidebar-card li { margin: 0; }
        .about-sidebar-card a {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-decoration: none;
          display: block;
          padding: 6px 8px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .about-sidebar-card a:hover {
          color: var(--accent-dark);
          background: var(--accent-soft);
        }
        @media (max-width: 768px) {
          .about-layout { grid-template-columns: 1fr; }
          .about-sidebar { position: static; }
        }
      `}</style>
    </div>
  );
}
