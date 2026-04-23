import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Question {
  id: string;
  text: string;
  options: { value: string; label: string; score: Record<string, number> }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'How often do you experience digestive discomfort (bloating, pain, cramping, urgency)?',
    options: [
      { value: 'rarely', label: 'Rarely or never', score: { ibs: 0, stress: 0, microbiome: 0 } },
      { value: 'monthly', label: 'A few times a month', score: { ibs: 1, stress: 1, microbiome: 1 } },
      { value: 'weekly', label: 'Several times a week', score: { ibs: 2, stress: 2, microbiome: 2 } },
      { value: 'daily', label: 'Daily or almost daily', score: { ibs: 3, stress: 3, microbiome: 3 } },
    ]
  },
  {
    id: 'q2',
    text: 'How would you describe your typical bowel pattern?',
    options: [
      { value: 'normal', label: 'Regular and comfortable', score: { ibs: 0, stress: 0, microbiome: 0 } },
      { value: 'constipation', label: 'Mostly constipation or sluggish', score: { ibs: 2, stress: 2, microbiome: 1 } },
      { value: 'diarrhea', label: 'Mostly loose or urgent', score: { ibs: 2, stress: 3, microbiome: 2 } },
      { value: 'alternating', label: 'Alternating between both', score: { ibs: 3, stress: 2, microbiome: 2 } },
    ]
  },
  {
    id: 'q3',
    text: 'How does stress affect your gut symptoms?',
    options: [
      { value: 'none', label: 'Stress doesn\'t seem to affect my gut', score: { ibs: 0, stress: 0, gutbrain: 0 } },
      { value: 'little', label: 'Stress makes symptoms slightly worse', score: { ibs: 1, stress: 1, gutbrain: 1 } },
      { value: 'moderate', label: 'Stress noticeably worsens my symptoms', score: { ibs: 2, stress: 2, gutbrain: 2 } },
      { value: 'major', label: 'Stress is a major trigger for my symptoms', score: { ibs: 2, stress: 3, gutbrain: 3 } },
    ]
  },
  {
    id: 'q4',
    text: 'Have you noticed connections between what you eat and your symptoms?',
    options: [
      { value: 'none', label: 'No clear food triggers', score: { fodmap: 0, microbiome: 0 } },
      { value: 'some', label: 'A few foods seem to bother me', score: { fodmap: 1, microbiome: 1 } },
      { value: 'many', label: 'Many foods cause symptoms', score: { fodmap: 2, microbiome: 2 } },
      { value: 'almost-all', label: 'Almost everything seems to cause problems', score: { fodmap: 3, microbiome: 3, sibo: 2 } },
    ]
  },
  {
    id: 'q5',
    text: 'How would you describe your bloating?',
    options: [
      { value: 'none', label: 'I rarely bloat', score: { sibo: 0, microbiome: 0 } },
      { value: 'after-eating', label: 'Bloating after certain meals', score: { sibo: 1, microbiome: 1, fodmap: 1 } },
      { value: 'most-meals', label: 'Bloating after most meals', score: { sibo: 2, microbiome: 2, fodmap: 2 } },
      { value: 'constant', label: 'Constant or severe bloating', score: { sibo: 3, microbiome: 2, fodmap: 2 } },
    ]
  },
  {
    id: 'q6',
    text: 'Have you taken antibiotics in the past 2 years?',
    options: [
      { value: 'no', label: 'No', score: { microbiome: 0 } },
      { value: 'once', label: 'Once', score: { microbiome: 1 } },
      { value: 'twice', label: 'Twice', score: { microbiome: 2 } },
      { value: 'multiple', label: 'Three or more times', score: { microbiome: 3, sibo: 1 } },
    ]
  },
  {
    id: 'q7',
    text: 'How does your gut feel in the morning before eating?',
    options: [
      { value: 'fine', label: 'Comfortable and calm', score: { ibs: 0, stress: 0 } },
      { value: 'anxious', label: 'Slightly anxious or unsettled', score: { ibs: 1, stress: 2, gutbrain: 2 } },
      { value: 'uncomfortable', label: 'Already uncomfortable', score: { ibs: 2, stress: 2, gutbrain: 1 } },
      { value: 'urgent', label: 'Urgent or painful', score: { ibs: 3, stress: 2, gutbrain: 1 } },
    ]
  },
  {
    id: 'q8',
    text: 'Do you have a history of anxiety, depression, or trauma?',
    options: [
      { value: 'no', label: 'No', score: { gutbrain: 0, stress: 0 } },
      { value: 'mild', label: 'Mild anxiety or stress', score: { gutbrain: 1, stress: 2 } },
      { value: 'moderate', label: 'Moderate anxiety or depression', score: { gutbrain: 2, stress: 2 } },
      { value: 'significant', label: 'Significant history of anxiety, depression, or trauma', score: { gutbrain: 3, stress: 2 } },
    ]
  },
  {
    id: 'q9',
    text: 'How long have you been dealing with gut symptoms?',
    options: [
      { value: 'new', label: 'Less than 6 months', score: { ibs: 0 } },
      { value: 'year', label: '6 months to 2 years', score: { ibs: 1 } },
      { value: 'years', label: '2 to 10 years', score: { ibs: 2 } },
      { value: 'lifetime', label: 'Most of my life', score: { ibs: 3, gutbrain: 2 } },
    ]
  },
  {
    id: 'q10',
    text: 'Have you been evaluated by a doctor for your gut symptoms?',
    options: [
      { value: 'no', label: 'No, I haven\'t seen a doctor', score: {} },
      { value: 'yes-normal', label: 'Yes, everything came back normal', score: { ibs: 2 } },
      { value: 'yes-ibs', label: 'Yes, I was diagnosed with IBS', score: { ibs: 3 } },
      { value: 'yes-other', label: 'Yes, I have another diagnosis', score: {} },
    ]
  }
];

interface ScoreMap {
  ibs: number;
  stress: number;
  microbiome: number;
  fodmap: number;
  sibo: number;
  gutbrain: number;
}

interface Result {
  archetype: string;
  headline: string;
  description: string;
  primaryFocus: string;
  articles: { slug: string; title: string }[];
  color: string;
}

function getResult(scores: ScoreMap): Result {
  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  if (total < 5) {
    return {
      archetype: 'The Stable Gut',
      headline: 'Your gut is in relatively good shape.',
      description: 'Your symptoms are mild or infrequent. The best thing you can do right now is maintain what\'s working, support your microbiome with diverse whole foods, and stay curious about the gut-brain connection.',
      primaryFocus: 'Prevention and optimization',
      articles: [
        { slug: 'your-gut-health-morning-routine-a-practical-protocol', title: 'Your Gut Health Morning Routine' },
        { slug: 'the-microbiome-reset-how-to-rebuild-after-antibiotics', title: 'The Microbiome Reset' },
      ],
      color: '#7A8B6F'
    };
  }

  if (dominant === 'gutbrain' || dominant === 'stress') {
    return {
      archetype: 'The Wired Gut',
      headline: 'Your gut and nervous system are deeply connected.',
      description: 'The gut-brain axis is central to your experience. Your symptoms are likely amplified by stress, anxiety, or unprocessed emotional material. This doesn\'t mean it\'s "all in your head" — it means the nervous system is running the show, and that\'s where healing starts.',
      primaryFocus: 'Nervous system regulation and gut-brain work',
      articles: [
        { slug: 'the-gut-brain-axis-why-your-belly-has-its-own-nervous-system', title: 'The Gut-Brain Axis' },
        { slug: 'the-vagus-nerve-and-your-gut-why-nervous-system-work-helps-digestion', title: 'The Vagus Nerve and Your Gut' },
        { slug: 'the-emotional-roots-of-digestive-problems', title: 'The Emotional Roots of Digestive Problems' },
      ],
      color: '#8B7A9F'
    };
  }

  if (dominant === 'sibo') {
    return {
      archetype: 'The Overgrown Gut',
      headline: 'SIBO or bacterial imbalance may be at the root.',
      description: 'Your pattern of severe bloating, multiple food triggers, and ongoing symptoms suggests bacterial overgrowth in the small intestine may be a factor. This is one of the most underdiagnosed conditions in gut health, and it\'s very treatable.',
      primaryFocus: 'SIBO investigation and treatment',
      articles: [
        { slug: 'sibo-explained-small-intestinal-bacterial-overgrowth-without-the-jargon', title: 'SIBO Explained' },
        { slug: 'functional-testing-your-gi-doctor-wont-order-and-why-you-might-want-it', title: 'Functional Testing' },
        { slug: 'herbal-medicine-for-ibs-peppermint-iberogast-and-beyond', title: 'Herbal Medicine for IBS' },
      ],
      color: '#9F8B5A'
    };
  }

  if (dominant === 'fodmap' || dominant === 'microbiome') {
    return {
      archetype: 'The Reactive Gut',
      headline: 'Your gut is reacting to food in a significant way.',
      description: 'You have multiple food triggers, and your microbiome may be out of balance. The good news: this is one of the most well-researched areas of gut health. The low-FODMAP diet, microbiome testing, and targeted probiotic support can make a real difference.',
      primaryFocus: 'Food sensitivity and microbiome restoration',
      articles: [
        { slug: 'the-low-fodmap-diet-what-it-is-who-its-for-and-why-its-not-forever', title: 'The Low-FODMAP Diet' },
        { slug: 'the-microbiome-reset-how-to-rebuild-after-antibiotics', title: 'The Microbiome Reset' },
        { slug: 'the-elimination-diet-the-gold-standard-nobody-wants-to-do', title: 'The Elimination Diet' },
      ],
      color: '#C4956A'
    };
  }

  // Default: IBS
  return {
    archetype: 'The Inflamed Gut',
    headline: 'You\'re dealing with classic IBS patterns.',
    description: 'Your symptoms match the IBS profile closely: chronic discomfort, bowel irregularity, and a gut that\'s been struggling for a while. The good news is that IBS is one of the most studied gut conditions, and there are real, evidence-based paths forward.',
    primaryFocus: 'IBS management and root cause investigation',
    articles: [
      { slug: 'ibs-is-not-just-stress-but-stress-is-part-of-it', title: 'IBS Is Not Just Stress' },
      { slug: 'probiotics-which-strains-actually-help-ibs-and-which-make-it-worse', title: 'Probiotics for IBS' },
      { slug: 'living-with-ibs-when-its-not-going-away', title: 'Living with IBS' },
    ],
    color: '#7A8B6F'
  };
}

export function QuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);

  function handleAnswer(questionId: string, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(q => q + 1);
      } else {
        calculateResult({ ...answers, [questionId]: value });
      }
    }, 300);
  }

  function calculateResult(finalAnswers: Record<string, string>) {
    const scores: ScoreMap = { ibs: 0, stress: 0, microbiome: 0, fodmap: 0, sibo: 0, gutbrain: 0 };
    for (const q of QUESTIONS) {
      const answer = finalAnswers[q.id];
      if (!answer) continue;
      const option = q.options.find(o => o.value === answer);
      if (!option) continue;
      for (const [key, val] of Object.entries(option.score)) {
        if (key in scores) (scores as any)[key] += val;
      }
    }
    setResult(getResult(scores));
  }

  function restart() {
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
  }

  const progress = ((currentQ) / QUESTIONS.length) * 100;

  if (result) {
    return (
      <div className="quiz-page">
        <div className="quiz-result container">
          <div className="result-card">
            <div className="result-archetype-badge" style={{ background: result.color + '22', color: result.color, borderColor: result.color + '44' }}>
              {result.archetype}
            </div>
            <h1 className="result-headline">{result.headline}</h1>
            <p className="result-description">{result.description}</p>
            <div className="result-focus">
              <span className="focus-label">Your primary focus:</span>
              <span className="focus-value">{result.primaryFocus}</span>
            </div>

            <div className="result-articles">
              <h2 className="result-articles-title">Start with these articles</h2>
              <div className="result-articles-list">
                {result.articles.map(a => (
                  <Link key={a.slug} to={`/articles/${a.slug}`} className="result-article-link">
                    <span className="result-article-arrow">→</span>
                    <span>{a.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="result-actions">
              <Link to="/articles" className="btn-primary">Browse All Articles</Link>
              <button onClick={restart} className="btn-secondary">Retake Quiz</button>
            </div>

            <p className="result-disclaimer">
              This quiz is for educational purposes only and is not a medical diagnosis.
              If you're experiencing significant digestive symptoms, please consult your healthcare provider.
            </p>
          </div>
        </div>
        <style>{quizStyles}</style>
      </div>
    );
  }

  const q = QUESTIONS[currentQ];

  return (
    <div className="quiz-page">
      <div className="quiz-hero">
        <div className="container">
          <span className="quiz-eyebrow">Gut Health Assessment</span>
          <h1 className="quiz-title">What's really going on in your gut?</h1>
          <p className="quiz-subtitle">10 questions. 3 minutes. A personalized reading of your digestive patterns.</p>
        </div>
      </div>

      <div className="quiz-body container">
        <div className="quiz-card">
          <div className="quiz-progress-wrap">
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="quiz-progress-label">Question {currentQ + 1} of {QUESTIONS.length}</span>
          </div>

          <div className="quiz-question">
            <h2 className="question-text">{q.text}</h2>
            <div className="question-options">
              {q.options.map(opt => (
                <button
                  key={opt.value}
                  className={`option-btn${answers[q.id] === opt.value ? ' selected' : ''}`}
                  onClick={() => handleAnswer(q.id, opt.value)}
                >
                  <span className="option-indicator" aria-hidden="true" />
                  <span className="option-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {currentQ > 0 && (
            <button className="quiz-back-btn" onClick={() => setCurrentQ(q => q - 1)}>
              &larr; Back
            </button>
          )}
        </div>
      </div>

      <style>{quizStyles}</style>
    </div>
  );
}

const quizStyles = `
  .quiz-page { padding-bottom: var(--space-3xl); }
  .quiz-hero {
    background: linear-gradient(160deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
    padding: var(--space-2xl) 0 var(--space-xl);
    border-bottom: 1px solid var(--border-light);
    text-align: center;
    margin-bottom: var(--space-2xl);
  }
  .quiz-eyebrow {
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
  .quiz-title {
    font-family: var(--font-heading);
    font-size: clamp(1.8rem, 3vw, 2.5rem);
    font-weight: 700;
    margin-bottom: var(--space-sm);
  }
  .quiz-subtitle {
    font-family: var(--font-ui);
    font-size: 1rem;
    color: var(--text-secondary);
  }
  .quiz-body { max-width: 640px; margin: 0 auto; }
  .quiz-card {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-xl);
    padding: var(--space-2xl);
    box-shadow: var(--shadow-md);
  }
  .quiz-progress-wrap {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
  }
  .quiz-progress-bar {
    flex: 1;
    height: 6px;
    background: var(--bg-secondary);
    border-radius: 3px;
    overflow: hidden;
  }
  .quiz-progress-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 3px;
    transition: width 300ms ease;
  }
  .quiz-progress-label {
    font-family: var(--font-ui);
    font-size: 0.8rem;
    color: var(--text-muted);
    white-space: nowrap;
  }
  .question-text {
    font-family: var(--font-heading);
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: var(--space-xl);
    color: var(--text-primary);
  }
  .question-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
  .option-btn {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    background: var(--bg-primary);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-md) var(--space-lg);
    cursor: pointer;
    text-align: left;
    transition: all var(--transition-fast);
    min-height: var(--tap-target-min);
  }
  .option-btn:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .option-btn.selected {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .option-indicator {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid var(--border);
    flex-shrink: 0;
    transition: all var(--transition-fast);
    background: var(--bg-card);
  }
  .option-btn:hover .option-indicator,
  .option-btn.selected .option-indicator {
    border-color: var(--accent);
    background: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .option-label {
    font-family: var(--font-ui);
    font-size: 0.95rem;
    color: var(--text-primary);
    line-height: 1.4;
  }
  .quiz-back-btn {
    background: none;
    border: none;
    font-family: var(--font-ui);
    font-size: 0.875rem;
    color: var(--text-muted);
    cursor: pointer;
    padding: var(--space-md) 0 0;
    transition: color var(--transition-fast);
  }
  .quiz-back-btn:hover { color: var(--text-primary); }

  /* Result */
  .quiz-result { max-width: 700px; margin: var(--space-2xl) auto; }
  .result-card {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-xl);
    padding: var(--space-2xl);
    box-shadow: var(--shadow-md);
  }
  .result-archetype-badge {
    display: inline-block;
    font-family: var(--font-ui);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 5px 14px;
    border-radius: var(--radius-xl);
    border: 1.5px solid;
    margin-bottom: var(--space-lg);
  }
  .result-headline {
    font-family: var(--font-heading);
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: var(--space-md);
    line-height: 1.25;
  }
  .result-description {
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: var(--space-lg);
  }
  .result-focus {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    padding: var(--space-md) var(--space-lg);
    margin-bottom: var(--space-xl);
  }
  .focus-label {
    font-family: var(--font-ui);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }
  .focus-value {
    font-family: var(--font-ui);
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  .result-articles { margin-bottom: var(--space-xl); }
  .result-articles-title {
    font-family: var(--font-heading);
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: var(--space-md);
  }
  .result-articles-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
  .result-article-link {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-family: var(--font-ui);
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--accent-dark);
    text-decoration: none;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-light);
    background: var(--bg-primary);
    transition: all var(--transition-fast);
  }
  .result-article-link:hover {
    background: var(--accent-soft);
    border-color: var(--accent-light);
    color: var(--accent-dark);
  }
  .result-article-arrow {
    color: var(--accent);
    font-size: 1rem;
  }
  .result-actions {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
    flex-wrap: wrap;
  }
  .result-disclaimer {
    font-family: var(--font-ui);
    font-size: 0.75rem;
    color: var(--text-muted);
    line-height: 1.5;
    border-top: 1px solid var(--border-light);
    padding-top: var(--space-md);
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
    border: none;
    cursor: pointer;
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
    cursor: pointer;
    transition: all var(--transition-fast);
    min-height: var(--tap-target-min);
  }
  .btn-secondary:hover { border-color: var(--accent); background: var(--accent-soft); }
  @media (max-width: 480px) {
    .quiz-card { padding: var(--space-lg); }
    .result-card { padding: var(--space-lg); }
    .result-actions { flex-direction: column; }
    .result-actions .btn-primary, .result-actions .btn-secondary { width: 100%; justify-content: center; }
  }
`;
