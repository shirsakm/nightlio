import { Flame, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { useTheme } from '../contexts/ThemeContext';

const Header = ({ currentStreak }) => {
  const { user, logout } = useAuth();
  useConfig();
  const { theme, cycle } = useTheme();
  // Subtitle helper removed (unused)

  // const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches;
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'var(--surface)',
      paddingBottom: '0.5rem',
      marginBottom: '0.75rem',
      borderBottom: '1px solid var(--border)',
      paddingLeft: 'var(--space-4)',
      paddingRight: 'var(--space-4)',
      paddingTop: 'var(--space-2)'
    }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.25rem',
        }}
      >
  {/* Left side - Streak */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {currentStreak > 0 && (
            <div
              style={{
                display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
                background: 'linear-gradient(135deg, var(--accent-600), var(--accent-700))',
                color: 'white',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
                fontWeight: '600',
                boxShadow: 'var(--shadow-sm), inset 0 1px 0 rgba(255, 255, 255, 0.16)',
    letterSpacing: '0.005em',
    lineHeight: 1,
    whiteSpace: 'nowrap',
              }}
            >
              <Flame size={14} strokeWidth={2} />
              <span>{currentStreak} Day Streak</span>
            </div>
          )}
        </div>    {/* Right side - User Profile and primary action (desktop) */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={cycle}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.4rem 0.8rem',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: 'var(--text)',
                transition: 'all 0.3s ease'
              }}
              title={`Theme: ${theme}`}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--accent-100)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {theme === 'dark' ? <Sun size={14} strokeWidth={2} /> : <Moon size={14} strokeWidth={2} />}
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
    color: 'var(--text)', 
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
                color: 'var(--text)',
                transition: 'all 0.3s ease'
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;