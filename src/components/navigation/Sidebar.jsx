import { Home, BarChart3, Trophy, Settings, PlusCircle, MoonStar } from 'lucide-react';

const Sidebar = ({ currentView, onViewChange, onLoadStatistics }) => {
  const items = [
    { key: 'history', label: 'Home', icon: Home },
    { key: 'entry', label: 'New Entry', icon: PlusCircle },
    { key: 'stats', label: 'Statistics', icon: BarChart3 },
    { key: 'achievements', label: 'Achievements', icon: Trophy },
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
        <div className="sidebar__brand" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-600)', display: 'grid', placeItems: 'center', color: 'var(--text)' }}>
              <MoonStar size={18} />
            </div>
            <strong style={{ color: 'var(--text)', letterSpacing: '-0.01em', fontSize: '1.5rem', fontWeight: '700' }}>Nightlio</strong>
          </div>
          <span style={{ color: 'var(--text)' , opacity: 0.85, fontSize: '0.875rem', paddingLeft: '0.25rem' }}>Your daily mood companion.</span>
        </div>

        <div className="sidebar__sections">
          {/* eslint-disable-next-line no-unused-vars */}
          {items.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleClick(key)}
              className={`sidebar__item ${currentView === key ? 'is-active' : ''}`}
              aria-current={currentView === key ? 'page' : undefined}
              title={label}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar__footer">
          <button
            onClick={() => handleClick('settings')}
            className={`sidebar__item ${currentView === 'settings' ? 'is-active' : ''}`}
            aria-current={currentView === 'settings' ? 'page' : undefined}
            title="Settings"
          >
            <Settings size={18} style={{ flexShrink: 0 }} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
