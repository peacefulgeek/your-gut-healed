import { Link } from 'react-router-dom';

const TAG = 'spankyspinola-20';

function amzUrl(asin: string) {
  return `https://www.amazon.com/dp/${asin}?tag=${TAG}`;
}

const TOOLKIT_SECTIONS = [
  {
    id: 'books',
    title: 'Books Worth Reading',
    icon: '📚',
    description: 'The books that actually changed how I understand my gut.',
    products: [
      { asin: 'B00IXJPQD2', name: 'The Mind-Gut Connection by Emeran Mayer', note: 'The single best book on the gut-brain axis.' },
      { asin: '1250301890', name: 'Fiber Fueled by Will Bulsiewicz', note: 'The most practical guide to microbiome-supportive eating.' },
      { asin: '1771641460', name: 'Gut: The Inside Story by Giulia Enders', note: 'Accessible, funny, and genuinely informative.' },
      { asin: '1250062098', name: 'The Microbiome Solution by Robynne Chutkan', note: 'Practical and evidence-based microbiome restoration.' },
      { asin: '1250756774', name: 'Healthy Gut Healthy You by Michael Ruscio', note: 'The best functional medicine overview for IBS and SIBO.' },
      { asin: 'B00JEKYNZF', name: 'SIBO Made Simple by Phoebe Lapine', note: 'The most approachable SIBO guide available.' },
    ]
  },
  {
    id: 'probiotics',
    title: 'Probiotics',
    icon: '🦠',
    description: 'Strains that have actual clinical evidence behind them for IBS and gut health.',
    products: [
      { asin: 'B00JEKYNZA', name: 'Culturelle Daily Probiotic', note: 'Lactobacillus rhamnosus GG — the most studied strain for IBS.' },
      { asin: 'B01DBTFO98', name: 'Florastor (Saccharomyces Boulardii)', note: 'Essential during and after antibiotics. Also helpful for IBS-D.' },
      { asin: 'B07CQXKBF5', name: 'Align Probiotic (Bifidobacterium)', note: 'The only probiotic with multiple RCTs specifically for IBS.' },
      { asin: 'B0013OXKHC', name: 'Jarrow Saccharomyces Boulardii + MOS', note: 'Excellent for SIBO recovery and post-antibiotic restoration.' },
      { asin: 'B0013OXKHY', name: 'Microbiome Labs MegaSporeBiotic', note: 'Spore-based, survives stomach acid, good for leaky gut.' },
    ]
  },
  {
    id: 'gut-repair',
    title: 'Gut Repair',
    icon: '✨',
    description: 'Supplements with evidence for intestinal lining support and leaky gut.',
    products: [
      { asin: 'B00JEKYNZM', name: 'L-Glutamine Powder by Thorne', note: 'The most researched supplement for intestinal permeability.' },
      { asin: 'B0013OXKHG', name: 'Zinc Carnosine by Integrative Therapeutics', note: 'Specifically studied for gastric and intestinal lining repair.' },
      { asin: 'B00NRFPTMK', name: 'Slippery Elm Bark by Nature\'s Way', note: 'Soothing mucilage that coats and protects the gut lining.' },
      { asin: 'B07CQXKBF9', name: 'GI Revive by Designs for Health', note: 'Comprehensive gut repair formula with multiple studied ingredients.' },
      { asin: 'B00JEKYNZO', name: 'Collagen Peptides by Vital Proteins', note: 'Supports intestinal lining integrity.' },
    ]
  },
  {
    id: 'digestive-support',
    title: 'Digestive Support',
    icon: '⚡',
    description: 'Enzymes, bitters, and HCl for better digestion.',
    products: [
      { asin: 'B00JEKYNZG', name: 'Enzymedica Digest Gold', note: 'The most comprehensive digestive enzyme formula available.' },
      { asin: 'B00NRFPTMG', name: 'Betaine HCl with Pepsin by Thorne', note: 'For low stomach acid — a common and underdiagnosed issue.' },
      { asin: 'B00JEKYNZ2', name: 'Digestive Bitters by Urban Moonshine', note: 'Stimulates bile and enzyme production naturally.' },
      { asin: 'B00NRFPTMM', name: 'Iberogast', note: 'Herbal formula with the most clinical evidence for functional dyspepsia and IBS.' },
    ]
  },
  {
    id: 'herbal',
    title: 'Herbal Support',
    icon: '🌿',
    description: 'Herbs with real evidence for gut symptoms.',
    products: [
      { asin: 'B07BNVWY6V', name: 'IBgard Peppermint Oil Capsules', note: 'Enteric-coated peppermint oil — the best-studied herbal for IBS.' },
      { asin: 'B07BNVWY6T', name: 'Berberine HCl by Thorne', note: 'Antimicrobial herb effective for SIBO and gut dysbiosis.' },
      { asin: 'B07CQXKBFD', name: 'Oil of Oregano by Gaia Herbs', note: 'Broad-spectrum antimicrobial for gut pathogens.' },
      { asin: 'B0013OXKHK', name: 'Triphala by Banyan Botanicals', note: 'Ayurvedic formula for gentle bowel regularity and microbiome support.' },
    ]
  },
  {
    id: 'nervous-system',
    title: 'Nervous System & Vagus Nerve',
    icon: '🧠',
    description: 'Tools for the gut-brain connection.',
    products: [
      { asin: 'B07CQXKBFH', name: 'Sensate Vagus Nerve Device', note: 'The most accessible vagus nerve stimulation device available.' },
      { asin: 'B00JEKYNZW', name: 'HeartMath Inner Balance HRV Biofeedback', note: 'HRV biofeedback for nervous system regulation.' },
      { asin: 'B00NRFPTMU', name: 'Magnesium Glycinate by Pure Encapsulations', note: 'For constipation, sleep, and stress — the most bioavailable form.' },
      { asin: 'B07BNVWY6B', name: 'L-Theanine 200mg by NOW Foods', note: 'Calming amino acid that supports the gut-brain axis.' },
    ]
  },
  {
    id: 'comfort',
    title: 'Comfort & Practical Tools',
    icon: '🛁',
    description: 'The practical stuff that actually helps on bad days.',
    products: [
      { asin: 'B0013OXKHO', name: 'Sunbeam Heating Pad', note: 'Heat therapy is genuinely effective for IBS cramping.' },
      { asin: 'B01DBTFO9I', name: 'Squatty Potty', note: 'Physiologically correct elimination posture. It works.' },
      { asin: 'B00NRFPTMS', name: 'Castor Oil Pack Kit', note: 'For constipation and liver support. Old remedy, real results.' },
      { asin: 'B00JEKYNZ8', name: 'Gut Feelings Journal', note: 'Food and symptom tracking is the foundation of any elimination protocol.' },
    ]
  }
];

export function ToolkitPage() {
  return (
    <div className="toolkit-page">
      <div className="toolkit-hero">
        <div className="container">
          <span className="toolkit-eyebrow">Gut Healing Toolkit</span>
          <h1 className="toolkit-title">The things that actually help.</h1>
          <p className="toolkit-subtitle">
            A curated collection of books, supplements, and tools for gut healing.
            Everything here is researched, evidence-based, and honestly recommended.
          </p>
          <div className="toolkit-disclosure">
            <strong>Disclosure:</strong> As an Amazon Associate I earn from qualifying purchases.
            These are paid links. I only recommend products I've researched thoroughly.
          </div>
        </div>
      </div>

      <div className="container toolkit-content">
        <div className="toolkit-nav">
          {TOOLKIT_SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`} className="toolkit-nav-link">
              <span>{s.icon}</span>
              <span>{s.title}</span>
            </a>
          ))}
        </div>

        {TOOLKIT_SECTIONS.map(section => (
          <section key={section.id} id={section.id} className="toolkit-section">
            <div className="toolkit-section-header">
              <span className="toolkit-section-icon">{section.icon}</span>
              <div>
                <h2 className="toolkit-section-title">{section.title}</h2>
                <p className="toolkit-section-desc">{section.description}</p>
              </div>
            </div>
            <div className="toolkit-products">
              {section.products.map(p => (
                <div key={p.asin} className="toolkit-product">
                  <div className="toolkit-product-img">
                    <a href={amzUrl(p.asin)} target="_blank" rel="nofollow sponsored noopener">
                      <img
                        src={`https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${p.asin}&Format=_SL160_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=${TAG}`}
                        alt={p.name}
                        loading="lazy"
                        width="80"
                        height="80"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </a>
                  </div>
                  <div className="toolkit-product-body">
                    <h3 className="toolkit-product-name">
                      <a href={amzUrl(p.asin)} target="_blank" rel="nofollow sponsored noopener">{p.name}</a>
                    </h3>
                    <p className="toolkit-product-note">{p.note}</p>
                    <a href={amzUrl(p.asin)} target="_blank" rel="nofollow sponsored noopener" className="toolkit-product-btn">
                      View on Amazon
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="toolkit-quiz-cta">
          <h2>Not sure where to start?</h2>
          <p>Take the 3-minute Gut Health Quiz for a personalized reading of your symptoms and where to focus.</p>
          <Link to="/gut-health-quiz" className="toolkit-quiz-btn">Take the Free Quiz</Link>
        </div>
      </div>

      <style>{`
        .toolkit-page { padding-bottom: var(--space-3xl); }
        .toolkit-hero {
          background: linear-gradient(160deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
          padding: var(--space-2xl) 0 var(--space-xl);
          border-bottom: 1px solid var(--border-light);
          margin-bottom: var(--space-2xl);
        }
        .toolkit-eyebrow {
          display: inline-block;
          font-family: var(--font-ui);
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--accent);
          background: var(--accent-soft);
          padding: 4px 12px;
          border-radius: var(--radius-xl);
          margin-bottom: var(--space-md);
        }
        .toolkit-title {
          font-family: var(--font-heading);
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          font-weight: 700;
          margin-bottom: var(--space-sm);
        }
        .toolkit-subtitle {
          font-family: var(--font-ui);
          font-size: 1rem;
          color: var(--text-secondary);
          max-width: 600px;
          line-height: 1.6;
          margin-bottom: var(--space-md);
        }
        .toolkit-disclosure {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--text-muted);
          background: var(--accent-warm-soft);
          border: 1px solid #e8c89a;
          border-radius: var(--radius-md);
          padding: var(--space-sm) var(--space-md);
          display: inline-block;
        }
        .toolkit-content { }
        .toolkit-nav {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
          margin-bottom: var(--space-2xl);
          padding: var(--space-lg);
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
        }
        .toolkit-nav-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-ui);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
          background: var(--bg-card);
          transition: all var(--transition-fast);
        }
        .toolkit-nav-link:hover {
          background: var(--accent-soft);
          border-color: var(--accent-light);
          color: var(--accent-dark);
        }
        .toolkit-section {
          margin-bottom: var(--space-3xl);
          scroll-margin-top: 88px;
        }
        .toolkit-section-header {
          display: flex;
          align-items: flex-start;
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
          padding-bottom: var(--space-lg);
          border-bottom: 2px solid var(--accent-soft);
        }
        .toolkit-section-icon {
          font-size: 2rem;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .toolkit-section-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: var(--space-xs);
        }
        .toolkit-section-desc {
          font-family: var(--font-ui);
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .toolkit-products {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
        }
        .toolkit-product {
          display: flex;
          gap: var(--space-md);
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          transition: box-shadow var(--transition-base);
        }
        .toolkit-product:hover { box-shadow: var(--shadow-md); }
        .toolkit-product-img {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .toolkit-product-img img { width: 100%; height: 100%; object-fit: contain; }
        .toolkit-product-body { flex: 1; min-width: 0; }
        .toolkit-product-name {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: var(--space-xs);
          line-height: 1.3;
        }
        .toolkit-product-name a { color: var(--text-primary); text-decoration: none; }
        .toolkit-product-name a:hover { color: var(--accent-dark); }
        .toolkit-product-note {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: var(--space-sm);
        }
        .toolkit-product-btn {
          display: inline-block;
          background: var(--accent-warm);
          color: #fff;
          font-family: var(--font-ui);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: var(--radius-xl);
          text-decoration: none;
          transition: background var(--transition-fast);
        }
        .toolkit-product-btn:hover { background: #a8784e; color: #fff; }
        .toolkit-quiz-cta {
          background: var(--accent-soft);
          border: 1px solid var(--accent-light);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          text-align: center;
          margin-top: var(--space-2xl);
        }
        .toolkit-quiz-cta h2 {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: var(--space-sm);
        }
        .toolkit-quiz-cta p {
          font-family: var(--font-ui);
          font-size: 0.9rem;
          color: var(--text-secondary);
          max-width: 480px;
          margin: 0 auto var(--space-lg);
          line-height: 1.6;
        }
        .toolkit-quiz-btn {
          display: inline-flex;
          align-items: center;
          background: var(--accent);
          color: #fff;
          font-family: var(--font-ui);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 12px 28px;
          border-radius: var(--radius-xl);
          text-decoration: none;
          transition: background var(--transition-fast);
          min-height: var(--tap-target-min);
        }
        .toolkit-quiz-btn:hover { background: var(--accent-dark); color: #fff; }
        @media (max-width: 768px) {
          .toolkit-products { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
