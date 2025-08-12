import { MOODS } from '../../utils/moodUtils';

const MoodDisplay = ({ moodValue, size = 32 }) => {
  const mood = MOODS.find(m => m.value === moodValue);
  
  if (!mood) return null;
  
  const IconComponent = mood.icon;
  
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '1rem',
        background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      }}
    >
      <IconComponent
        size={size}
        strokeWidth={1.5}
        style={{ color: mood.color }}
      />
      <span
        style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          color: mood.color,
        }}
      >
        Feeling {mood.label}
      </span>
    </div>
  );
};

export default MoodDisplay;