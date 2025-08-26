import { Home, BarChart3, Trophy, Settings, PlusCircle } from 'lucide-react';

const Sidebar = ({ currentView, onViewChange, onLoadStatistics }) => {
  const items = [
  { key: 'history', label: 'Home', icon: Home },
  { key: 'entry', label: 'Entry', icon: PlusCircle },
    { key: 'stats', label: 'Statistics', icon: BarChart3 },
    { key: 'achievements', label: 'Achievements', icon: Trophy },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleClick = (key) => {
    onViewChange(key);
    if (key === 'stats' && typeof onLoadStatistics === 'function') {
      onLoadStatistics();
    }
  };

  return (
    <aside className={`sidebar`}>
      <div className="sidebar__inner">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleClick(key)}
            className={`sidebar__item ${currentView === key ? 'is-active' : ''}`}
            title={label}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
