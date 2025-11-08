import './LandingPage.css';

const highlights = [
  {
    title: 'Mood-first journaling',
    description: 'Capture how you feel in a few taps and let Nightlio suggest meaningful prompts that evolve with your habits.'
  },
  {
    title: 'Actionable reflections',
    description: 'Turn streaks, trends, and group rituals into personal insights you can actually act on.'
  },
  {
    title: 'Privacy on your terms',
    description: 'Self-host or use our cloud. Either way, your data stays yours. End-to-end encrypted backups keep memories safe.'
  }
];

const featureBlocks = [
  {
    title: 'Plan with intention',
    items: [
      'Focus on weekly goals that nudge you forward',
      'Celebrate milestones with achievement badges',
      'Bring friends or teammates together with shared groups'
    ]
  },
  {
    title: 'Reflect without friction',
    items: [
      'Fast keyboard shortcuts to log moods in seconds',
      'Rich markdown editor with images, code, and callouts',
      'Context-aware prompts that surface when you need them'
    ]
  },
  {
    title: 'See the bigger picture',
    items: [
      'Mood insights layered with energy, sleep, and tags',
      'Calendar heatmaps and trendlines you can export',
      'Weekly digest summaries delivered to your inbox'
    ]
  }
];

const LandingPage = () => {
  return (
    <div className="landing">
      <header className="landing__hero">
        <nav className="landing__nav">
          <a className="landing__brand" href="/">
            <img src="/logo.png" alt="Nightlio logo" className="landing__brand-mark" />
            <span className="landing__brand-name">Nightlio</span>
          </a>
          <div className="landing__nav-links">
            <a href="#features">Features</a>
            <a href="#why-nightlio">Why Nightlio</a>
            <a href="#cta">Start Today</a>
          </div>
          <div className="landing__nav-actions">
            <a className="landing__link" href="/docs/DEPLOYMENT">Docs</a>
            <a className="landing__button landing__button--ghost" href="https://github.com/shirsakm/nightlio" target="_blank" rel="noreferrer">GitHub</a>
            <a className="landing__button" href="/">Launch App</a>
          </div>
        </nav>

        <div className="landing__hero-body">
          <div className="landing__hero-copy">
            <span className="landing__tag">Track what matters</span>
            <h1>Nightlio keeps your mood, memories, and meaning in sync.</h1>
            <p>
              A calm, modern journal for teams and individuals who want more than streak counters.
              Log in seconds, reflect with intention, and build rituals around the moments that matter.
            </p>
            <div className="landing__cta-group">
              <a className="landing__button landing__button--primary" href="/">Get started free</a>
              <a className="landing__button landing__button--ghost" href="/login">Sign in</a>
            </div>
            <dl className="landing__stats">
              <div>
                <dt>5k+</dt>
                <dd>Daily reflections logged</dd>
              </div>
              <div>
                <dt>94%</dt>
                <dd>Report feeling more mindful after two weeks</dd>
              </div>
              <div>
                <dt>Zero ads</dt>
                <dd>Your data stays in your hands</dd>
              </div>
            </dl>
          </div>
          <div className="landing__hero-visual">
            <div className="landing__card">
              <div className="landing__card-header">
                <span className="landing__card-label">Tonight</span>
                <span className="landing__card-time">10:36 PM</span>
              </div>
              <div className="landing__mood">
                <span className="landing__mood-emoji" role="img" aria-label="Glowing moon">🌙</span>
                <div>
                  <p className="landing__mood-title">Feeling grounded</p>
                  <p className="landing__mood-subtitle">2 day streak • Gratitude tag</p>
                </div>
              </div>
              <p className="landing__note">
                Wrapped up the day with a quiet walk. Noticed how the cool air reset my headspace and made the lingering worries feel smaller.
              </p>
              <div className="landing__timeline">
                <span className="landing__dot landing__dot--active"></span>
                <span className="landing__dot"></span>
                <span className="landing__dot"></span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="why-nightlio" className="landing__section landing__section--alt">
        <h2>Designed for mindful nights and focused mornings.</h2>
        <div className="landing__grid">
          {highlights.map((item) => (
            <article key={item.title} className="landing__tile">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="landing__section">
        <h2>Everything you need to capture your story</h2>
        <div className="landing__feature-columns">
          {featureBlocks.map((block) => (
            <div key={block.title} className="landing__feature">
              <h3>{block.title}</h3>
              <ul>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="landing__section landing__section--alt">
        <div className="landing__testimonials">
          <blockquote>
            “Nightlio replaced our scattered notes and gave the team a ritual we actually look forward to. The weekly digest keeps us aligned without another meeting.”
          </blockquote>
          <cite>
            <span>Amelia Chen</span>
            <span>Design lead, Luminous Studio</span>
          </cite>
        </div>
      </section>

      <section id="cta" className="landing__section landing__section--cta">
        <div className="landing__cta">
          <div>
            <h2>Take the weight off your mind.</h2>
            <p>Spin up Nightlio in minutes. Use our hosted version or self-host with the confidence of open-source.</p>
          </div>
          <div className="landing__cta-buttons">
            <a className="landing__button landing__button--primary" href="/">Open the app</a>
            <a className="landing__button landing__button--ghost" href="https://github.com/shirsakm/nightlio" target="_blank" rel="noreferrer">View on GitHub</a>
          </div>
        </div>
      </section>

      <footer className="landing__footer">
        <div className="landing__footer-brand">
          <img src="/logo.png" alt="Nightlio logo" className="landing__brand-mark" />
          <span>Nightlio</span>
        </div>
        <div className="landing__footer-links">
          <a href="/docs/DEPLOYMENT">Deployment Guide</a>
          <a href="/docs/DOCKER">Docker Setup</a>
          <a href="mailto:hi@nightlio.app">Contact</a>
        </div>
        <p className="landing__footer-note">© {new Date().getFullYear()} Nightlio. Built for mindful teams and solo creators.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
