import { Zap, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { useTheme } from '../contexts/ThemeContext';

const Header = ({ currentView, currentStreak }) => {
  const { user, logout } = useAuth();
  const { config } = useConfig();
  const { theme, cycle } = useTheme();
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
      case 'achievements':
        return 'Unlock achievements';
      default:
        return 'Your daily mood companion';
    }
  };

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches;
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.25rem',
        }}
      >
        {/* Left side - Logo and Streak */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
  <h1
    style={{
      color: 'var(--text)',
      margin: '0',
    fontSize: isMobile ? '2rem' : '2.5rem',
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
        background: 'var(--accent-50)',
        color: 'var(--accent-700)',
                padding: '0.4rem 0.8rem',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--accent-100)',
        fontSize: '0.85rem',
                fontWeight: '600',
        boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Zap size={16} />
              <span>{currentStreak}</span>
            </div>
          )}
        </div>

    {/* Right side - User Profile and primary action (desktop) */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={cycle}
              style={{
                padding: '0.4rem 0.8rem',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}
              title={`Theme: ${theme}`}
            >
              Theme: {theme}
            </button>
            {/* Primary CTA moved to HistoryView and Sidebar to reduce duplication */}
      {/* Web3 controls removed */}

            {/* User Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {user.avatar_url && (
        <img
                  src={user.avatar_url}
                  alt={user.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
          border: '2px solid var(--accent-600)'
                  }}
                />
              )}
              <span style={{ 
        color: 'var(--text-muted)', 
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {user.name}
              </span>
            </div>
            
            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.4rem 0.8rem',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                transition: 'all 0.3s ease'
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
    <p
        style={{
      color: 'var(--text)',
      margin: '0 0 2px 0',
          fontSize: isMobile ? '1rem' : '1.125rem',
          fontWeight: '600',
        }}
      >
        {currentView === 'history' && 'Your daily mood companion'}
        {currentView === 'entry' && 'New Entry'}
        {currentView === 'stats' && 'Statistics'}
        {currentView === 'achievements' && 'Achievements'}
        {currentView === 'settings' && 'Settings'}
      </p>
    <p
        style={{
          color: 'var(--text-muted)',
      margin: 0,
          fontSize: '0.95rem',
          fontWeight: '400',
        }}
      >
        {getSubtitle()}
      </p>
    </div>
  );
};

export default Header;