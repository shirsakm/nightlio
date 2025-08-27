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
    style={{ color: mood.color }}
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