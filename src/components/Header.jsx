import { Flame, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { useTheme } from '../contexts/ThemeContext';
import SearchPlaceholder from './search/SearchPlaceholder';
import { useEffect } from 'react';
import { useToast } from './ui/ToastProvider';

const Header = ({ currentStreak }) => {
  const { user, logout } = useAuth();
  useConfig();
  const { theme, cycle } = useTheme();
  const { show } = useToast();

  // Focus search on '/' and show ephemeral toast
  useEffect(() => {
    const shouldSkipShortcut = (target) => {
      if (!target) return false;

      const element =
        typeof Node !== 'undefined' && target.nodeType === Node.TEXT_NODE
          ? target.parentElement
          : target;

      if (!element) return false;

      const tagName = element.tagName || '';
      if (/^(INPUT|TEXTAREA|SELECT)$/i.test(tagName)) return true;

      if (element.isContentEditable) return true;
      if (element.closest('[contenteditable="true"]')) return true;

      const markdownContainer = element.closest('.mdx-editor');
      if (markdownContainer) {
        const editableSurface = markdownContainer.querySelector(
          '[data-lexical-editor], [contenteditable="true"]'
        );
        if (editableSurface && editableSurface.contains(element)) return true;
      }

      return false;
    };

    const onKey = (e) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (shouldSkipShortcut(e.target)) return;
        e.preventDefault();
        const input = document.getElementById('global-search-input');
        if (input) {
          input.focus();
          show('Search focused — search not yet implemented', 'info', 1500);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show]);

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'var(--surface)',
  paddingBottom: '0.5rem',
  marginBottom: 0,
      borderBottom: '1px solid var(--border)',
  paddingLeft: 'var(--gutter-page)',
  paddingRight: 'var(--gutter-page)',
      paddingTop: 'var(--space-2)'
    }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.25rem',
          gap: '1rem',
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
                background: 'linear-gradient(135deg, var(--accent-bg), var(--accent-bg-2))',
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
        </div>

        {/* Center - Search Placeholder */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 600 }}>
            <SearchPlaceholder />
          </div>
        </div>

        {/* Right side - User Profile and primary action (desktop) */}
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
                e.target.style.backgroundColor = 'var(--accent-bg-soft)';
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