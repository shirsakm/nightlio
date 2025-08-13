import { Zap } from 'lucide-react';

const Header = ({ currentView, currentStreak }) => {
  const getSubtitle = () => {
    switch (currentView) {
      case 'history':
        return 'How are you feeling today?';
      case 'entry':
        return `Recording for ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString(
          [],
          { hour: '2-digit', minute: '2-digit', hour12: true }
        )}`;
      case 'stats':
        return 'Your mood insights and patterns';
      default:
        return 'Your daily mood companion';
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '0.5rem',
        }}
      >
        <h1
          style={{
            background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0',
            fontSize: '3.5rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
          }}
        >
          Nightlio
        </h1>
        {currentStreak > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
            }}
          >
            <Zap size={16} />
            <span>{currentStreak}</span>
          </div>
        )}
      </div>
      <p
        style={{
          color: '#666',
          margin: '0.5rem 0',
          fontSize: '1.2rem',
          fontWeight: '400',
        }}
      >
        Your daily mood companion
      </p>
      <p
        style={{
          color: '#999',
          margin: '0',
          fontSize: '1rem',
          fontWeight: '300',
        }}
      >
        {getSubtitle()}
      </p>
    </div>
  );
};

export default Header;