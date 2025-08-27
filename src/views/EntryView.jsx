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
              background: 'var(--accent-600)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: 'var(--shadow-md)',
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
            background: 'var(--accent-600)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-md)',
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
        background: 'linear-gradient(135deg, var(--accent-600), var(--accent-700))',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: !isSubmitting ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                fontWeight: '600',
        boxShadow: '0 8px 25px color-mix(in oklab, var(--accent-600), transparent 70%)'
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
        background: 'var(--bg-card)',
              padding: '2rem',
              borderRadius: '16px',
        boxShadow: 'var(--shadow-3)',
        border: '1px solid var(--border)',
              textAlign: 'center',
              minWidth: '300px',
              maxWidth: 'min(560px, 90%)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <div style={{
        color: submitMessage.includes('achievement') ? 'var(--accent-600)' : 'var(--text)',
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
      background: 'var(--overlay)',
            zIndex: 5
          }}
        />
      )}
    </div>
  );
};

export default EntryView;