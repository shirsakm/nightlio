import { useState, useRef } from 'react';
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
  onEntrySubmitted 
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
      
      await apiService.createMoodEntry({
        mood: selectedMood,
        date: now.toLocaleDateString(),
        time: now.toISOString(),
        content: markdownContent,
        selected_options: selectedOptions,
      });

      setSubmitMessage('Entry saved successfully! 🎉');
      
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
              marginTop: '1rem',
              padding: '0.5rem',
              color: submitMessage.includes('success') ? '#4ecdc4' : '#ff6b6b',
              fontWeight: '500',
              textAlign: 'center',
            }}
          >
            {submitMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryView;