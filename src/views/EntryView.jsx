import { useState, useRef, useEffect } from 'react';
import MoodPicker from '../components/mood/MoodPicker';
import MoodDisplay from '../components/mood/MoodDisplay';
import GroupSelector from '../components/groups/GroupSelector';
import GroupManager from '../components/groups/GroupManager';
import MDArea from '../components/MarkdownArea.jsx';
import apiService from '../services/api';
import { useToast } from '../components/ui/ToastProvider';

const DEFAULT_MARKDOWN = `# How was your day?

Write about your thoughts, feelings, and experiences...`;

const EntryView = ({ 
  selectedMood, 
  groups, 
  onBack, 
  onCreateGroup, 
  onCreateOption, 
  onEntrySubmitted,
  onSelectMood,
  editingEntry = null,
  onEntryUpdated,
}) => {
  const isEditing = Boolean(editingEntry);
  const [selectedOptions, setSelectedOptions] = useState(
    editingEntry?.selections?.map((selection) => selection.id) ?? []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const markdownRef = useRef();
  const { show } = useToast();

  useEffect(() => {
    if (!isEditing || !editingEntry) return;

    setSelectedOptions(editingEntry.selections?.map((selection) => selection.id) ?? []);

    const instance = markdownRef.current?.getInstance?.();
    if (instance && typeof instance.setMarkdown === 'function') {
      instance.setMarkdown(editingEntry.content || '');
    }
  }, [isEditing, editingEntry]);

  useEffect(() => {
    if (isEditing) {
      setSubmitMessage('');
    }
  }, [isEditing]);

  const handleOptionToggle = (optionId) => {
    setSelectedOptions(prev => (prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      if (!selectedMood) {
        show('Pick a mood before saving your entry.', 'error');
        setIsSubmitting(false);
        return;
      }

      const markdownContent = markdownRef.current?.getMarkdown() || '';
      if (!markdownContent.trim()) {
        show('Write a few thoughts before saving.', 'error');
        setIsSubmitting(false);
        return;
      }

      if (isEditing && editingEntry) {
        const response = await apiService.updateMoodEntry(editingEntry.id, {
          mood: selectedMood,
          content: markdownContent,
          selected_options: selectedOptions,
        });

        if (response?.entry && typeof onEntryUpdated === 'function') {
          onEntryUpdated({
            ...editingEntry,
            ...response.entry,
            selections: response.entry.selections ?? [],
          });
        }

        show('Entry updated successfully!', 'success');
        return;
      }

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

  markdownRef.current?.getInstance()?.setMarkdown(DEFAULT_MARKDOWN);

      setSelectedOptions([]);
      setTimeout(() => {
        onEntrySubmitted();
      }, 1500);
  } catch (error) {
      console.error('Failed to save entry:', error);
      if (isEditing) {
        show('Failed to update entry. Please try again.', 'error');
      } else {
        setSubmitMessage('Failed to save entry. Please try again.');
      }
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
              background: 'var(--accent-bg)',
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
            {isEditing ? '← Cancel Edit' : '← Back'}
          </button>
        </div>
        <h3 style={{ marginTop: 0 }}>
          {isEditing ? 'Pick a new mood for this entry' : 'Pick your mood to start an entry'}
        </h3>
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
            background: 'var(--accent-bg)',
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
          {isEditing ? '← Cancel Edit' : '← Back to History'}
        </button>
      </div>

      <div className="entry-grid">
        <div className="entry-left">
          {isEditing && editingEntry && (
            <div style={{
              marginBottom: '0.75rem',
              fontSize: '0.85rem',
              color: 'color-mix(in oklab, var(--text), transparent 40%)'
            }}>
              Editing entry from <strong style={{ color: 'var(--text)' }}>{editingEntry.date}</strong>
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <MoodDisplay moodValue={selectedMood} />
            {isEditing && (
              <button
                type="button"
                onClick={() => onSelectMood(null)}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
              >
                Change mood
              </button>
            )}
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
  background: 'linear-gradient(135deg, var(--accent-bg), var(--accent-bg-2))',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: !isSubmitting ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                fontWeight: '600',
    boxShadow: 'var(--shadow-md)'
              }}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Entry'}
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