import { MOODS } from '../../utils/moodUtils';
import './MoodPicker.css';

const MoodPicker = ({ onMoodSelect }) => {
  return (
    <div className="mood-grid">
      {MOODS.map(mood => {
        const IconComponent = mood.icon;
        return (
          <button
            key={mood.value}
            onClick={() => onMoodSelect(mood.value)}
            className="mood-button"
            style={{
              background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
              color: mood.color,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
            title={mood.label}
          >
            <IconComponent size={40} strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
};

export default MoodPicker;