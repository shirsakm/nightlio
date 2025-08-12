import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Frown, Meh, Smile, Laugh, Heart, Zap, BarChart3, Calendar, Home } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import MDArea from './components/MarkdownArea.jsx';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedMood, setSelectedMood] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [currentView, setCurrentView] = useState('history'); // 'history', 'entry', 'stats'
  const [pastEntries, setPastEntries] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [statistics, setStatistics] = useState(null);
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

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
      setStatistics(null);
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

  const getWeeklyMoodData = () => {
    const today = new Date();
    const weekData = [];
    
    // Create entry lookup by date
    const entryLookup = {};
    pastEntries.forEach(entry => {
      entryLookup[entry.date] = entry;
    });
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      const entry = entryLookup[dateStr];
      
      weekData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        mood: entry ? entry.mood : null,
        moodEmoji: entry ? getMoodIcon(entry.mood).icon : null,
        hasEntry: !!entry
      });
    }
    
    return weekData;
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
          {currentView === 'history' ? 'How are you feeling today?' : 
           currentView === 'entry' ? `Recording for ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}` :
           'Your mood insights and patterns'}
        </p>
        
        {/* Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          justifyContent: 'center',
          marginTop: '1rem'
        }}>
          <button
            onClick={() => setCurrentView('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.5rem 1rem',
              background: currentView === 'history' 
                ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                : 'transparent',
              color: currentView === 'history' ? 'white' : '#667eea',
              border: currentView === 'history' ? 'none' : '1px solid #667eea',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            <Home size={16} />
            Home
          </button>
          <button
            onClick={() => {
              setCurrentView('stats');
              loadStatistics();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.5rem 1rem',
              background: currentView === 'stats' 
                ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                : 'transparent',
              color: currentView === 'stats' ? 'white' : '#667eea',
              border: currentView === 'stats' ? 'none' : '1px solid #667eea',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            <BarChart3 size={16} />
            Stats
          </button>
        </div>
      </div>
      {currentView === 'history' ? (
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
                    setCurrentView('entry');
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
      ) : currentView === 'entry' ? (
        <>
          {/* New Entry Page */}
          <div style={{ marginBottom: '2rem' }}>
            <button
              onClick={() => {
                setCurrentView('history');
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
                      setCurrentView('history');
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
      ) : (
        <>
          {/* Statistics Page */}
          {statistics ? (
            <div style={{ textAlign: 'left' }}>
              {/* Overview Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
                    {statistics.statistics.total_entries}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Entries</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4ecdc4' }}>
                    {statistics.statistics.average_mood?.toFixed(1) || '0.0'}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>Average Mood</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ff6b6b' }}>
                    {statistics.current_streak}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>Current Streak</div>
                </div>
              </div>

              {/* Weekly Mood Trend */}
              <div style={{
                background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
              }}>
                <h3 style={{ 
                  margin: '0 0 1.5rem 0', 
                  color: '#333',
                  fontSize: '1.3rem',
                  fontWeight: '600'
                }}>
                  Weekly Mood Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getWeeklyMoodData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      domain={[0.5, 5.5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickFormatter={(value) => {
                        const moodLabels = { 1: 'T', 2: 'B', 3: 'O', 4: 'G', 5: 'A' };
                        return moodLabels[value] || '';
                      }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        if (value === null) return ['No entry', ''];
                        const moodLabels = { 1: 'Terrible', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Amazing' };
                        return [`${moodLabels[value]}`, ''];
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#667eea" 
                      strokeWidth={3}
                      dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                
                {/* Icon Legend for Line Chart */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '1.5rem',
                  marginTop: '1rem',
                  flexWrap: 'wrap'
                }}>
                  {[
                    { value: 1, icon: Frown, color: '#ff6b6b', label: 'Terrible' },
                    { value: 2, icon: Frown, color: '#ffa726', label: 'Bad' },
                    { value: 3, icon: Meh, color: '#ffca28', label: 'Okay' },
                    { value: 4, icon: Smile, color: '#66bb6a', label: 'Good' },
                    { value: 5, icon: Heart, color: '#42a5f5', label: 'Amazing' }
                  ].map(mood => {
                    const IconComponent = mood.icon;
                    return (
                      <div key={mood.value} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        color: '#666'
                      }}>
                        <IconComponent size={16} style={{ color: mood.color }} />
                        <span>{mood.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mood Distribution Chart */}
              <div style={{
                background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
              }}>
                <h3 style={{ 
                  margin: '0 0 1.5rem 0', 
                  color: '#333',
                  fontSize: '1.3rem',
                  fontWeight: '600'
                }}>
                  Mood Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={(() => {
                    const moodLabels = ['Terrible', 'Bad', 'Okay', 'Good', 'Amazing'];
                    const moodColors = ['#ff6b6b', '#ffa726', '#ffca28', '#66bb6a', '#42a5f5'];
                    const moodIcons = ['T', 'B', 'O', 'G', 'A']; // Short labels for now
                    
                    return [1, 2, 3, 4, 5].map(moodValue => ({
                      mood: moodIcons[moodValue - 1],
                      label: moodLabels[moodValue - 1],
                      count: statistics.mood_distribution[moodValue] || 0,
                      fill: moodColors[moodValue - 1]
                    }));
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="mood" 
                      tick={{ fontSize: 16 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name, props) => [
                        `${value} entries`,
                        `${props.payload.label}`
                      ]}
                    />
                    <Bar 
                      dataKey="count" 
                      radius={[4, 4, 0, 0]}
                      label={{ 
                        position: 'top', 
                        fontSize: 12, 
                        fontWeight: '600',
                        fill: '#333'
                      }}
                    >
                      {(() => {
                        const moodColors = ['#ff6b6b', '#ffa726', '#ffca28', '#66bb6a', '#42a5f5'];
                        return [1, 2, 3, 4, 5].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={moodColors[index]} />
                        ));
                      })()}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                
                {/* Icon Legend for Bar Chart */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '1.5rem',
                  marginTop: '1rem',
                  flexWrap: 'wrap'
                }}>
                  {[
                    { value: 1, icon: Frown, color: '#ff6b6b', label: 'Terrible' },
                    { value: 2, icon: Frown, color: '#ffa726', label: 'Bad' },
                    { value: 3, icon: Meh, color: '#ffca28', label: 'Okay' },
                    { value: 4, icon: Smile, color: '#66bb6a', label: 'Good' },
                    { value: 5, icon: Heart, color: '#42a5f5', label: 'Amazing' }
                  ].map(mood => {
                    const IconComponent = mood.icon;
                    return (
                      <div key={mood.value} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        color: '#666'
                      }}>
                        <IconComponent size={16} style={{ color: mood.color }} />
                        <span>{mood.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Calendar View */}
              <div style={{
                background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
              }}>
                <h3 style={{ 
                  margin: '0 0 1.5rem 0', 
                  color: '#333',
                  fontSize: '1.3rem',
                  fontWeight: '600'
                }}>
                  Mood Calendar
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '0.5rem',
                  fontSize: '0.8rem'
                }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={{ 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#666',
                      padding: '0.5rem'
                    }}>
                      {day}
                    </div>
                  ))}
                  {(() => {
                    const today = new Date();
                    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    const startDate = new Date(firstDay);
                    startDate.setDate(startDate.getDate() - firstDay.getDay());
                    
                    const days = [];
                    const current = new Date(startDate);
                    
                    // Create entry lookup by date
                    const entryLookup = {};
                    pastEntries.forEach(entry => {
                      entryLookup[entry.date] = entry;
                    });
                    
                    while (current <= lastDay || current.getDay() !== 0) {
                      const dateStr = current.toLocaleDateString();
                      const entry = entryLookup[dateStr];
                      const isCurrentMonth = current.getMonth() === today.getMonth();
                      
                      days.push(
                        <div key={current.toISOString()} style={{
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px',
                          background: entry ? getMoodIcon(entry.mood).color + '20' : 'transparent',
                          border: current.toDateString() === today.toDateString() ? '2px solid #667eea' : 'none',
                          opacity: isCurrentMonth ? 1 : 0.3,
                          fontSize: entry ? '1.2rem' : '0.9rem',
                          fontWeight: entry ? '600' : '400',
                          color: entry ? getMoodIcon(entry.mood).color : '#666'
                        }}>
                          {entry ? (
                            (() => {
                              const { icon: IconComponent } = getMoodIcon(entry.mood);
                              return <IconComponent size={16} />;
                            })()
                          ) : (
                            current.getDate()
                          )}
                        </div>
                      );
                      current.setDate(current.getDate() + 1);
                    }
                    
                    return days;
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading statistics...</div>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default App
