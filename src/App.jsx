import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import MDArea from './components/MarkdownArea.jsx';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedMood, setSelectedMood] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [pastEntries, setPastEntries] = useState([]);
  const markdownRef = useRef();

  const moods = [
    { label: "😢", value: 1 },
    { label: "😞", value: 2 },
    { label: "😐", value: 3 },
    { label: "😊", value: 4 },
    { label: "😁", value: 5 },
  ];

  useEffect(() => {
    fetch('/api/time')
      .then(response => response.json())
      .then(data => {
        setCurrentTime(data.time);
      })
    }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/moods');
      const data = await response.json();
      setPastEntries(data.reverse()); // Show newest first
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const getMoodEmoji = (moodValue) => {
    const moodMap = { 1: "😢", 2: "😞", 3: "😐", 4: "😊", 5: "😁" };
    return moodMap[moodValue] || "😐";
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          color: '#667eea', 
          marginBottom: '0.5rem',
          fontSize: '2.5rem'
        }}>
          Nightlio
        </h1>
        <p style={{ 
          color: '#666', 
          margin: '0.5rem 0',
          fontSize: '1.1rem'
        }}>
          Nightly Mood Tracker
        </p>
        <p style={{ 
          color: '#888', 
          margin: '0',
          fontSize: '0.9rem'
        }}>
          {showHistory ? 'Past Entries' : `Recording for ${new Date(currentTime * 1000).toLocaleDateString()}`}
        </p>
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) loadHistory();
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {showHistory ? 'New Entry' : 'View History'}
          </button>
        </div>
      </div>
      {!showHistory ? (
        <>
          <div className="mood-grid">
            {moods.map(mood => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`mood-button ${selectedMood === mood.value ? 'selected' : ''}`}
              >
                {mood.label}
              </button>
            ))}
          </div>
          <MDArea ref={markdownRef} />
          <div style={{ marginTop: '3rem' }}>
            <button
              disabled={!selectedMood || isSubmitting}
              onClick={async () => {
                if (!selectedMood) {
                  setSubmitMessage('Please select a mood first!');
                  return;
                }
                
                setIsSubmitting(true);
                setSubmitMessage('');
                
                try {
                  const markdownContent = markdownRef.current?.getMarkdown() || '';
                  const response = await fetch('/api/mood', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      mood: selectedMood,
                      date: new Date(currentTime * 1000).toLocaleDateString(),
                      content: markdownContent,
                    })
                  });
                  
                  if (response.ok) {
                    setSubmitMessage('Entry saved successfully! 🎉');
                    setSelectedMood(null);
                    // Reset the editor
                    markdownRef.current?.getInstance()?.setMarkdown('# How was your day?\n\nWrite about your thoughts, feelings, and experiences...');
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
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                backgroundColor: selectedMood ? '#4CAF50' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: selectedMood && !isSubmitting ? 'pointer' : 'not-allowed'
              }}>
              {isSubmitting ? 'Saving...' : 'Submit Entry'}
            </button>
            {submitMessage && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.5rem',
                color: submitMessage.includes('success') ? 'green' : 'red'
              }}>
                {submitMessage}
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'left' }}>
          {pastEntries.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No entries yet. Create your first mood entry!</p>
          ) : (
            pastEntries.map((entry, index) => (
              <div key={index} style={{
                border: '1px solid #eee',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '0.5rem',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{getMoodEmoji(entry.mood)}</span>
                  <span style={{ fontWeight: 'bold', color: '#667eea' }}>{entry.date}</span>
                </div>
                <div style={{ 
                  color: '#333',
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
      )}
    </>
  )
}

export default App
