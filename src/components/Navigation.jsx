import { Home, BarChart3, Trophy } from 'lucide-react';

const Navigation = ({ currentView, onViewChange, onLoadStatistics }) => {
  const handleStatsClick = () => {
    onViewChange('stats');
    onLoadStatistics();
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
        marginTop: '1rem',
        marginBottom: '3rem',
      }}
    >
      <button
        onClick={() => onViewChange('history')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 1rem',
          background: currentView === 'history' ? 'var(--accent-50)' : 'transparent',
          color: currentView === 'history' ? 'var(--accent-700)' : 'var(--text)',
          border: currentView === 'history' ? '1px solid var(--accent-100)' : '1px solid var(--border)',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '600',
          transition: 'background 180ms ease, color 180ms ease, border-color 180ms ease',
        }}
      >
        <Home size={16} />
        Home
      </button>
      <button
        onClick={handleStatsClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 1rem',
          background: currentView === 'stats' ? 'var(--accent-50)' : 'transparent',
          color: currentView === 'stats' ? 'var(--accent-700)' : 'var(--text)',
          border: currentView === 'stats' ? '1px solid var(--accent-100)' : '1px solid var(--border)',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '600',
          transition: 'background 180ms ease, color 180ms ease, border-color 180ms ease',
        }}
      >
        <BarChart3 size={16} />
        Stats
      </button>
      <button
        onClick={() => onViewChange('achievements')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 1rem',
          background: currentView === 'achievements' ? 'var(--accent-50)' : 'transparent',
          color: currentView === 'achievements' ? 'var(--accent-700)' : 'var(--text)',
          border: currentView === 'achievements' ? '1px solid var(--accent-100)' : '1px solid var(--border)',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '600',
          transition: 'background 180ms ease, color 180ms ease, border-color 180ms ease',
        }}
      >
        <Trophy size={16} />
        Achievements
      </button>
    </div>
  );
};

export default Navigation;