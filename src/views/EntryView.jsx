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
    setSelectedOptions(prev => (prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]));
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

      if (response.new_achievements && response.new_achievements.length > 0) {
        const achievementNames = {
          'first_entry': 'First Entry',
          'week_warrior': 'Week Warrior',
          'consistency_king': 'Consistency King',
          'data_lover': 'Data Lover',
          'mood_master': 'Mood Master'
        };
        const readableNames = response.new_achievements.map(type => achievementNames[type] || type).join(', ');
        setSubmitMessage(`Entry saved! 🎉 New achievement unlocked: ${readableNames}`);
      } else {
        setSubmitMessage('Entry saved successfully! 🎉');
      }

      markdownRef.current?.getInstance()?.setMarkdown('# How was your day?\n\nWrite about your thoughts, feelings, and experiences...');

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
      <div style={{ marginTop: '1rem' }}>
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
    <div className="entry-container" style={{ marginTop: '1rem', position: 'relative' }}>
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
          ← Back to History
        </button>
      </div>

      <div className="entry-grid">
        <div className="entry-left">
          <div style={{ marginBottom: '1rem' }}>
            <MoodDisplay moodValue={selectedMood} />
          </div>
          <GroupSelector
            groups={groups}
            selectedOptions={selectedOptions}
            onOptionToggle={handleOptionToggle}
          />
          <div style={{ marginTop: '1rem' }}>
            <GroupManager
              groups={groups}
              onCreateGroup={onCreateGroup}
              onCreateOption={onCreateOption}
            />
          </div>
        </div>

        <div className="entry-right">
          <MDArea ref={markdownRef} />
          <div className="entry-savebar">
            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              style={{
                padding: '0.9rem 2rem',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: !isSubmitting ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                fontWeight: '600',
                boxShadow: '0 8px 25px rgba(78, 205, 196, 0.3)'
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>
      </div>

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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
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
  );
};

export default EntryView;