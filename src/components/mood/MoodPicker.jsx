import { MOODS } from '../../utils/moodUtils';
import './MoodPicker.css';

const MoodPicker = ({ onMoodSelect }) => {
  
  //Handler to manage both saving the mood and playing music
  const handleMoodClick = async (mood) => {
    onMoodSelect(mood.value);

    // 2. Intercept and fetch music
    try {
      const res = await fetch(`http://localhost:5000/api/music/vibe?tag=${mood.tag}`);
      const data = await res.json();
      
      if (data.audio_url) {
        // Broadcast the music data to the permanent MusicDock
        window.dispatchEvent(new CustomEvent('playMoodMusic', { 
            detail: { ...data, color: mood.color } 
        }));
      }
    } catch (err) {
      console.error("Music fetch failed:", err);
    }
  };

  return (
    <div className="mood-grid">
      {MOODS.map(mood => {
        const IconComponent = mood.icon;
        return (
          <button
            key={mood.value}
            onClick={() => handleMoodClick(mood)} 
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