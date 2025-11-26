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
            <span className="landing__tag">Your data, your rules</span>
            <h1>Privacy-first mood tracker and daily journal.</h1>
            <p>
              Designed for effortless self-hosting. Your data, your server, your rules. 
              No ads, no subscriptions, and absolutely no data mining.
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
                <span className="landing__dot landing__dot--active" aria-hidden="true"></span>
                <span className="landing__dot" aria-hidden="true"></span>
                <span className="landing__dot" aria-hidden="true"></span>
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
