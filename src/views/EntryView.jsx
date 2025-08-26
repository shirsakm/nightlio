import { useState, useRef } from 'react';
import MoodPicker from '../components/mood/MoodPicker';
import MoodDisplay from '../components/mood/MoodDisplay';
import GroupSelector from '../components/groups/GroupSelector';
import GroupManager from '../components/groups/GroupManager';
import MDArea from '../components/MarkdownArea.jsx';
import apiService from '../services/api';

const EntryView = ({ 
  selectedMood, 
  groups, 
  onBack, 
  onCreateGroup, 
  onCreateOption, 
  onEntrySubmitted,
  onSelectMood,
}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const markdownRef = useRef();

  const handleOptionToggle = (optionId) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const markdownContent = markdownRef.current?.getMarkdown() || '';
      const now = new Date();
      
      const response = await apiService.createMoodEntry({
        mood: selectedMood,
        date: now.toLocaleDateString(),
        time: now.toISOString(),
        content: markdownContent,
        selected_options: selectedOptions,
      });

      // Check for new achievements
      if (response.new_achievements && response.new_achievements.length > 0) {
        // Map achievement types to readable names
        const achievementNames = {
          'first_entry': 'First Entry',
          'week_warrior': 'Week Warrior',
          'consistency_king': 'Consistency King',
          'data_lover': 'Data Lover',
          'mood_master': 'Mood Master'
        };
        
        const readableNames = response.new_achievements
          .map(type => achievementNames[type] || type)
          .join(', ');
        
        setSubmitMessage(`Entry saved! 🎉 New achievement unlocked: ${readableNames}`);
      } else {
        setSubmitMessage('Entry saved successfully! 🎉');
      }
      
      // Reset the editor
      markdownRef.current?.getInstance()?.setMarkdown('# How was your day?\n\nWrite about your thoughts, feelings, and experiences...');
      
      // Return to history after a short delay
      setTimeout(() => {
        onEntrySubmitted();
      }, 1500);
    } catch (error) {
      setSubmitMessage('Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedMood) {
    return (
      <div style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={onBack}
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            }}
          >
            ← Back
          </button>
        </div>
        <h3 style={{ marginTop: 0 }}>Pick your mood to start an entry</h3>
        <MoodPicker onMoodSelect={onSelectMood} />
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={onBack}
          style={{
            padding: '0.5rem 1rem',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          }}
        >
          ← Back to History
        </button>
      </div>

      {/* Selected Mood Display */}
      <div style={{ marginBottom: '2rem' }}>
        <MoodDisplay moodValue={selectedMood} />
      </div>

      {/* Groups Section */}
      <GroupSelector
        groups={groups}
        selectedOptions={selectedOptions}
        onOptionToggle={handleOptionToggle}
      />

      {/* Group Management */}
      <div style={{ marginBottom: '2rem' }}>
        <GroupManager
          groups={groups}
          onCreateGroup={onCreateGroup}
          onCreateOption={onCreateOption}
        />
      </div>

      {/* Markdown Editor */}
      <MDArea ref={markdownRef} />

      {/* Submit Button */}
      <div style={{ marginTop: '3rem' }}>
        <button
          disabled={isSubmitting}
          onClick={handleSubmit}
          style={{
            padding: '1rem 2.5rem',
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: !isSubmitting ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            fontWeight: '600',
            boxShadow: '0 8px 25px rgba(78, 205, 196, 0.3)',
            transform: 'translateY(-2px)',
          }}
        >
          {isSubmitting ? 'Saving...' : 'Save Entry'}
        </button>
        {submitMessage && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              zIndex: 10,
            }}
          >
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
                minWidth: '300px',
                maxWidth: 'min(560px, 90%)',
              }}
            >
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              🎉
            </div>
            <div style={{
              color: submitMessage.includes('achievement') ? '#4ecdc4' : '#333',
              fontWeight: '600',
              fontSize: '1.1rem',
              lineHeight: '1.4'
            }}>
              {submitMessage}
            </div>
            </div>
          </div>
        )}
        
        {/* Backdrop */}
        {submitMessage && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.35)',
              zIndex: 5
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EntryView;