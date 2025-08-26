import { Home, BarChart3, Trophy, Settings, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ currentView, onViewChange, onLoadStatistics, collapsed = false, onToggleCollapse }) => {
  const items = [
  { key: 'history', label: 'History', icon: Home },
  { key: 'entry', label: 'New Entry', icon: PlusCircle },
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
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar__inner">
        <button
          className="sidebar__item sidebar__toggle"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span>{collapsed ? 'Expand' : 'Collapse'}</span>
        </button>
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleClick(key)}
            className={`sidebar__item ${currentView === key ? 'is-active' : ''}`}
            title={label}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
