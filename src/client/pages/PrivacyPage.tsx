export function PrivacyPage() {
  return (
    <div className="privacy-page">
      <div className="container">
        <h1>Privacy Policy</h1>
        <p className="privacy-updated">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose">
          <h2>Overview</h2>
          <p>
            Your Gut Healed ("we," "us," or "our") respects your privacy. This policy explains what
            information we collect, how we use it, and your rights.
          </p>

          <h2>Information We Collect</h2>
          <p>
            <strong>Newsletter subscriptions:</strong> If you subscribe to our newsletter, we collect
            your email address. We use this only to send you the newsletter. We do not sell or share
            your email with third parties.
          </p>
          <p>
            <strong>Analytics:</strong> We use privacy-respecting analytics to understand how visitors
            use the site. This may include page views, referral sources, and general geographic data.
            We do not use Google Analytics.
          </p>
          <p>
            <strong>Cookies:</strong> We use minimal cookies necessary for site functionality.
            We do not use advertising cookies or tracking pixels.
          </p>

          <h2>Amazon Affiliate Disclosure</h2>
          <p>
            This site participates in the Amazon Services LLC Associates Program, an affiliate
            advertising program designed to provide a means for sites to earn advertising fees by
            advertising and linking to Amazon.com. When you click an Amazon link and make a purchase,
            we earn a small commission at no extra cost to you.
          </p>

          <h2>Health Disclaimer</h2>
          <p>
            The content on this site is for educational purposes only and is not intended as medical
            advice, diagnosis, or treatment. Always consult a qualified healthcare provider before
            starting any new supplement, diet, or health protocol. Digestive symptoms can indicate
            serious medical conditions that require professional evaluation.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this privacy policy? Contact us through{' '}
            <a href="https://theoraclelover.com" target="_blank" rel="noopener noreferrer">theoraclelover.com</a>.
          </p>
        </div>
      </div>

      <style>{`
        .privacy-page { padding: var(--space-2xl) 0 var(--space-3xl); }
        .privacy-page h1 {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: var(--space-sm);
        }
        .privacy-updated {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: var(--space-2xl);
        }
        .prose { max-width: var(--max-content-width); }
        .prose h2 {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 700;
          margin-top: 2em;
          margin-bottom: 0.75em;
          padding-top: 0.5em;
          border-top: 1px solid var(--border-light);
        }
        .prose p { margin-bottom: 1.2em; line-height: 1.7; }
      `}</style>
    </div>
  );
}
