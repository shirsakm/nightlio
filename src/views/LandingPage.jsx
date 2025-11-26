import './LandingPage.css';

const highlights = [
  {
    title: 'Rich Journaling',
    description: 'Write detailed notes for every entry using Markdown for formatting, lists, and links.'
  },
  {
    title: 'Track & Analyze',
    description: 'Log your daily mood on a simple 5-point scale and use customizable tags to discover what influences your mind.'
  },
  {
    title: 'Privacy First',
    description: 'Your sensitive data is stored in a simple SQLite database file on your server. No third-party trackers or analytics.'
  }
];

const featureBlocks = [
  {
    title: 'Gamified Consistency',
    items: [
      'Stay consistent with built-in achievements',
      'Unlock badges as you build your journaling habit',
      'Track your journaling streak to stay motivated'
    ]
  },
  {
    title: 'Effortless Logging',
    items: [
      'Log your daily mood on a simple 5-point scale',
      'Use customizable tags like "Sleep" or "Productivity"',
      'Fast keyboard shortcuts to log moods in seconds'
    ]
  },
  {
    title: 'Insightful Analytics',
    items: [
      'View your mood history on a calendar heatmap',
      'See your average mood over time',
      'Discover patterns in your state of mind'
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
            <a href="#why-nightlio">About</a>
          </div>
          <div className="landing__nav-actions">
            <a className="landing__button landing__button--icon" href="https://github.com/shirsakm/nightlio" target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            <a className="landing__button landing__button--primary landing__button--circle" href="/" aria-label="Launch App">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </nav>

        <div className="landing__hero-body">
          <div className="landing__hero-copy">
            <span className="landing__tag">Your data, your rules</span>
            <h1>Privacy-first mood tracker and daily journal.</h1>
            <p>
              Designed for effortless self-hosting. Your data, your server, your rules. 
              No ads, no subscriptions, and absolutely no data mining.
            </p>
            <div className="landing__cta-group">
              <a className="landing__button landing__button--primary" href="/">Get started for free</a>
              <a className="landing__button landing__button--ghost" href="https://github.com/shirsakm/nightlio">View on GitHub</a>
            </div>
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
                <span className="landing__dot landing__dot--active" aria-hidden="true"></span>
                <span className="landing__dot" aria-hidden="true"></span>
                <span className="landing__dot" aria-hidden="true"></span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="why-nightlio" className="landing__section landing__section--alt">
        <h2>Designed for mindful nights and focused mornings</h2>
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



      <section id="cta" className="landing__section landing__section--cta">
        <div className="landing__cta">
          <div>
            <h2>Take the weight off your mind.</h2>
            <p>Get up and running in minutes with a single Docker command. Self-host with confidence.</p>
          </div>
          <div className="landing__cta-buttons">
            <a className="landing__button landing__button--primary" href="/">Open the app</a>
            <a className="landing__button landing__button--ghost" href="https://github.com/shirsakm/nightlio" target="_blank" rel="noreferrer">View on GitHub</a>
          </div>
        </div>
      </section>

      <footer className="landing__footer">
        <p className="landing__footer-note">© 2025 Nightlio. Open source and privacy-first.</p>
        <div className="landing__footer-links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="mailto:hello@nightlio.com">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
