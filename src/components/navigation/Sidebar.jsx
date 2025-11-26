import { Home, BarChart3, Trophy, Settings, Target } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ onLoadStatistics }) => {
  const items = [
    { key: '', label: 'Home', icon: Home, end: true },
    { key: 'goals', label: 'Goals', icon: Target },
    { key: 'stats', label: 'Statistics', icon: BarChart3 },
    { key: 'achievements', label: 'Achievements', icon: Trophy },
  ];

  const handleClick = (key) => {
    if (key === 'stats' && typeof onLoadStatistics === 'function') {
      onLoadStatistics();
    }
  };

  return (
    <aside className={`sidebar`}>
      <div className="sidebar__inner">
        <div className="sidebar__brand" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', display: 'grid', placeItems: 'center', color: 'var(--text)', overflow: 'hidden' }}>
              <img
                src={'/logo.png'}
                alt="Nightlio"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: 'transparent', outline: 'none' }}
              />
            </div>
            <strong style={{ color: 'var(--text)', letterSpacing: '-0.01em', fontSize: '1.5rem', fontWeight: '700' }}>Nightlio</strong>
          </div>
          <span style={{ color: 'var(--text)' , opacity: 0.85, fontSize: '0.875rem', paddingLeft: '0.25rem' }}>Your daily mood companion.</span>
        </div>

        <div className="sidebar__sections">
          {items.map(({ key, label, icon: Icon, end }) => (
            <NavLink
              key={key}
              to={key}
              end={end}
              onClick={() => handleClick(key)}
              className={({ isActive }) => `sidebar__item ${isActive ? 'is-active' : ''}`}
              title={label}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar__footer">
          <NavLink
            to="settings"
            className={({ isActive }) => `sidebar__item ${isActive ? 'is-active' : ''}`}
            title="Settings"
          >
            <Settings size={18} style={{ flexShrink: 0 }} />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
