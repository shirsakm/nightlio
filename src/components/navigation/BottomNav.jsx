import { Home, BarChart3, Trophy, Settings } from 'lucide-react';

const BottomNav = ({ currentView, onViewChange, onLoadStatistics }) => {
  const items = [
    { key: 'history', label: 'Home', icon: Home },
    { key: 'stats', label: 'Stats', icon: BarChart3 },
    { key: 'achievements', label: 'Awards', icon: Trophy },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleClick = (key) => {
    onViewChange(key);
    if (key === 'stats' && typeof onLoadStatistics === 'function') {
      onLoadStatistics();
    }
  };

  return (
    <nav className="bottom-nav">
      {items.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => handleClick(key)}
          className={`bottom-nav__item ${currentView === key ? 'is-active' : ''}`}
          aria-label={label}
        >
          <Icon size={20} />
          <span className="bottom-nav__label">{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
