import React from 'react';
import { Link } from 'react-router-dom';
import './AboutPage.css';
import './LandingPage.css';

const AboutPage = () => {
  return (
    <div className="about-page landing">
      <header className="landing__hero" style={{ paddingBottom: 0 }}>
        <nav className="landing__nav">
          <Link to="/" className="landing__brand">
            <img src="/logo.png" alt="Nightlio logo" className="landing__brand-mark" />
            <span className="landing__brand-name">Nightlio</span>
          </Link>
          <div className="landing__nav-links">
            <a href="#features">Features</a>
            <Link to="/about" className="active">About</Link>
          </div>
          <div className="landing__nav-actions">
            <a className="landing__button landing__button--icon" href="https://github.com/shirsakm/nightlio" target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            <Link className="landing__button landing__button--primary landing__button--circle" to="/dashboard" aria-label="Launch App">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </nav>
      </header>

      <main className="about__content">
        <header className="about__header">
          <h1>The Story of Nightlio</h1>
          <p className="about__subtitle">From a personal frustration to an award-winning open source project.</p>
        </header>

        <section className="about__section">
          <h2>How it Started</h2>
          <p>
            I recently started keeping track of my daily moods and decided to start journaling alongside it. 
            After some research, one of the most used apps for mood logging seemed to be Daylio, so I downloaded it. 
            Turns out, it's truly a great app, and it's truly great at shilling its subscription.
          </p>
          <p>
            I got annoyed, and decided I would just make a FOSS (Free and Open Source Software) alternative for my personal use instead. 
            And here I am, presenting to you ✨ Nightlio ✨.
          </p>
          <p>
            My goal was simple: create a privacy-first, self-hosted mood tracker that doesn't lock features behind a paywall or sell your data.
          </p>
        </section>

        <section className="about__section">
          <h2>Building in the Open</h2>
          <p>
            I shared the initial project with the self-hosted community and received incredible feedback. 
            Nightlio is designed from the ground up to be easily self-hosted.
          </p>
          <p>
            Since the initial release, I've been hard at work:
          </p>
          <ul>
            <li><strong>Docker Support:</strong> The most requested feature is now live, allowing you to spin up an instance in minutes.</li>
            <li><strong>Desktop-First UI:</strong> Unlike mobile-only apps, Nightlio features a layout optimized for desktop use.</li>
            <li><strong>Dark Theme:</strong> Because every developer tool needs a dark mode.</li>
          </ul>
        </section>

        <section className="about__section">
          <h2>Winning the GitHub Hackathon</h2>
          <div className="about__highlight">
            <p>
              <strong>Update:</strong> We won the "For the Love of Code" hackathon hosted by GitHub! 🏆
            </p>
          </div>
          <p>
            Despite balancing this project with academics, Nightlio has continued to grow. 
            We've added Google OAuth support for self-hosted users (making it easier to host on public-facing servers), 
            implemented Daily Goals, and made significant quality-of-life improvements.
          </p>
        </section>

        <section className="about__section">
          <h2>Our Philosophy</h2>
          <p>
            Nightlio is built for mindful teams and solo creators. It's a mood logger and journal that won't suck your data and soul.
            It is, and always will be, free and open source.
          </p>
          <p>
            If you find this project useful, please consider leaving a star on the <a href="https://github.com/shirsakm/nightlio">GitHub repo</a>—it really helps new users trust lesser-known projects.
          </p>
        </section>
      </main>

      <footer className="landing__footer">
        <p className="landing__footer-note">© 2025 Nightlio. Open source and privacy-first.</p>
        <div className="landing__footer-links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a href="mailto:hello@nightlio.com">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
