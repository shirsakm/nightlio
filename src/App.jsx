import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Frown, Meh, Smile, Laugh, Heart, Zap } from 'lucide-react';
import MDArea from './components/MarkdownArea.jsx';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedMood, setSelectedMood] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showHistory, setShowHistory] = useState(true);
  const [pastEntries, setPastEntries] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const markdownRef = useRef();

  const moods = [
    { icon: Frown, value: 1, color: '#ff6b6b', label: 'Terrible' },
    { icon: Frown, value: 2, color: '#ffa726', label: 'Bad' },
    { icon: Meh, value: 3, color: '#ffca28', label: 'Okay' },
    { icon: Smile, value: 4, color: '#66bb6a', label: 'Good' },
    { icon: Heart, value: 5, color: '#42a5f5', label: 'Amazing' },
  ];

  useEffect(() => {
    fetch('/api/time')
      .then(response => response.json())
      .then(data => {
        setCurrentTime(data.time);
      });
    
    // Load history and streak on initial page load
    loadHistory();
    loadStreak();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/moods');
      const data = await response.json();
      setPastEntries(data); // Already sorted by created_at DESC
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const loadStreak = async () => {
    try {
      const response = await fetch('/api/streak');
      const data = await response.json();
      setCurrentStreak(data.current_streak);
    } catch (error) {
      console.error('Failed to load streak:', error);
      setCurrentStreak(0);
    }
  };

  const getMoodIcon = (moodValue) => {
    const mood = moods.find(m => m.value === moodValue);
    if (!mood) return { icon: Meh, color: '#ffca28' };
    return { icon: mood.icon, color: mood.color };
  };

  const formatEntryTime = (entry) => {
    // If we have a created_at timestamp, use it
    if (entry.created_at) {
      const date = new Date(entry.created_at);
      const time = date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      return `${entry.date} at ${time}`;
    }
    // Fallback to just the date
    return entry.date;
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '0.5rem'
        }}>
          <h1 style={{ 
            background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0',
            fontSize: '3.5rem',
            fontWeight: '800',
            letterSpacing: '-0.02em'
          }}>
            Nightlio
          </h1>
          {currentStreak > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)'
            }}>
              <Zap size={16} />
              <span>{currentStreak}</span>
            </div>
          )}
        </div>
        <p style={{ 
          color: '#666', 
          margin: '0.5rem 0',
          fontSize: '1.2rem',
          fontWeight: '400'
        }}>
          Your daily mood companion
        </p>
        <p style={{ 
          color: '#999', 
          margin: '0',
          fontSize: '1rem',
          fontWeight: '300'
        }}>
          {showHistory ? 'How are you feeling today?' : `Recording for ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`}
        </p>
      </div>
      {showHistory ? (
        <>
          {/* Mood Picker on History Page */}
          <div className="mood-grid">
            {moods.map(mood => {
              const IconComponent = mood.icon;
              return (
                <button
                  key={mood.value}
                  onClick={() => {
                    setSelectedMood(mood.value);
                    setShowHistory(false);
                  }}
                  className="mood-button"
                  style={{
                    background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                    color: mood.color,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                  title={mood.label}
                >
                  <IconComponent size={40} strokeWidth={1.5} />
                </button>
              );
            })}
          </div>
          
          {/* History Entries */}
          <div style={{ textAlign: 'left', marginTop: '2rem' }}>
            {pastEntries.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#4C566A' }}>No entries yet. Select a mood above to create your first entry!</p>
            ) : (
              pastEntries.map((entry) => (
                <div key={entry.id || entry.date} style={{
                  border: 'none',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '0.5rem',
                    gap: '0.5rem'
                  }}>
                    <span style={{ 
                      fontSize: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      color: getMoodIcon(entry.mood).color
                    }}>
                      {(() => {
                        const { icon: IconComponent } = getMoodIcon(entry.mood);
                        return <IconComponent size={24} strokeWidth={1.5} />;
                      })()}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ 
                        fontWeight: '600', 
                        color: '#667eea',
                        fontSize: '1.1rem'
                      }}>{entry.date}</span>
                      {entry.created_at && (
                        <span style={{ 
                          fontSize: '0.9rem',
                          color: '#999',
                          fontWeight: '400'
                        }}>
                          {new Date(entry.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ 
                    color: '#2E3440',
                    lineHeight: '1.6'
                  }}>
                    <ReactMarkdown className="history-markdown">
                      {entry.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* New Entry Page */}
          <div style={{ marginBottom: '2rem' }}>
            <button
              onClick={() => {
                setShowHistory(true);
                setSelectedMood(null);
                setSubmitMessage('');
              }}
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
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
            >
              ← Back to History
            </button>
          </div>

          {/* Selected Mood Display */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '1rem',
              background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}>
              {(() => {
                const mood = moods.find(m => m.value === selectedMood);
                if (!mood) return null;
                const IconComponent = mood.icon;
                return (
                  <>
                    <IconComponent size={32} strokeWidth={1.5} style={{ color: mood.color }} />
                    <span style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: '600',
                      color: mood.color
                    }}>
                      Feeling {mood.label}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>

          <MDArea ref={markdownRef} />
          
          <div style={{ marginTop: '3rem' }}>
            <button
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                setSubmitMessage('');
                
                try {
                  const markdownContent = markdownRef.current?.getMarkdown() || '';
                  const now = new Date();
                  const response = await fetch('/api/mood', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      mood: selectedMood,
                      date: now.toLocaleDateString(),
                      time: now.toISOString(),
                      content: markdownContent,
                    })
                  });
                  
                  if (response.ok) {
                    setSubmitMessage('Entry saved successfully! 🎉');
                    // Reset the editor
                    markdownRef.current?.getInstance()?.setMarkdown('# How was your day?\n\nWrite about your thoughts, feelings, and experiences...');
                    // Return to history after a short delay
                    setTimeout(() => {
                      setShowHistory(true);
                      setSelectedMood(null);
                      setSubmitMessage('');
                      loadHistory(); // Refresh history
                      loadStreak(); // Refresh streak
                    }, 1500);
                  } else {
                    setSubmitMessage('Failed to save entry. Please try again.');
                  }
                } catch (error) {
                  setSubmitMessage('Failed to save entry. Please try again.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
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
                transform: 'translateY(-2px)'
              }}>
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
            {submitMessage && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.5rem',
                color: submitMessage.includes('success') ? '#4ecdc4' : '#ff6b6b',
                fontWeight: '500',
                textAlign: 'center'
              }}>
                {submitMessage}
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default App
