import { Home, BarChart3, Trophy, Settings, Target } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const BottomNav = ({ onLoadStatistics }) => {
  const items = [
    { key: '', label: 'Home', icon: Home, end: true },
    { key: 'goals', label: 'Goals', icon: Target },
    { key: 'stats', label: 'Stats', icon: BarChart3 },
    { key: 'achievements', label: 'Awards', icon: Trophy },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleClick = (key) => {
    if (key === 'stats' && typeof onLoadStatistics === 'function') {
      onLoadStatistics();
    }
  };

  return (
    <nav className="bottom-nav">
      {items.map(({ key, label, icon: Icon, end }) => (
        <NavLink
          key={key}
          to={key}
          end={end}
          onClick={() => handleClick(key)}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
          aria-label={label}
        >
          <Icon size={20} />
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
