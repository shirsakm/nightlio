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
          gap: '0.3rem',
          padding: '0.5rem 1rem',
          background:
            currentView === 'history'
              ? 'linear-gradient(135deg, #667eea, #764ba2)'
              : 'transparent',
          color: currentView === 'history' ? 'white' : '#667eea',
          border: currentView === 'history' ? 'none' : '1px solid #667eea',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500',
          transition: 'all 0.3s ease',
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
          gap: '0.3rem',
          padding: '0.5rem 1rem',
          background:
            currentView === 'stats'
              ? 'linear-gradient(135deg, #667eea, #764ba2)'
              : 'transparent',
          color: currentView === 'stats' ? 'white' : '#667eea',
          border: currentView === 'stats' ? 'none' : '1px solid #667eea',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500',
          transition: 'all 0.3s ease',
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
          gap: '0.3rem',
          padding: '0.5rem 1rem',
          background:
            currentView === 'achievements'
              ? 'linear-gradient(135deg, #667eea, #764ba2)'
              : 'transparent',
          color: currentView === 'achievements' ? 'white' : '#667eea',
          border: currentView === 'achievements' ? 'none' : '1px solid #667eea',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500',
          transition: 'all 0.3s ease',
        }}
      >
        <Trophy size={16} />
        Achievements
      </button>
    </div>
  );
};

export default Navigation;