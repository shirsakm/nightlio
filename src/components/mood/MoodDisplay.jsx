import { MOODS } from '../../utils/moodUtils';

const MoodDisplay = ({ moodValue, size = 32, showLabel = true, children = null }) => {
  const mood = MOODS.find(m => m.value === moodValue);
  const isIconOnly = !showLabel;
  
  if (!mood) return null;
  
  const IconComponent = mood.icon;
  
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: children ? 'space-between' : 'center',
        gap: isIconOnly ? '0.85rem' : '1rem',
        padding: isIconOnly ? '0.75rem 0.9rem' : '1rem',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {children && (
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
          {children}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: showLabel ? '1rem' : 0,
          flexShrink: 0,
          marginLeft: children ? 'auto' : 0,
        }}
      >
        <IconComponent
          size={isIconOnly ? Math.max(24, size - 2) : size}
          strokeWidth={1.5}
          style={{ color: mood.color }}
        />
        {showLabel && (
          <span
            style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: mood.color,
            }}
          >
            Feeling {mood.label}
          </span>
        )}
      </div>
    </div>
  );
};

export default MoodDisplay;