import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedMood, setSelectedMood] = useState(null);

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

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '5rem' }}>
        <h1>
          Nightlio
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span>
            Nightly Mood Tracker
          </span>
          <span>
            Recording for {new Date(currentTime * 1000).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {moods.map(mood => (
          <button
            key={mood.value}
            onClick={() => setSelectedMood(mood.value)}
            style={{
              fontSize: '2rem',
              background: selectedMood === mood.value ? '#eee' : 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {mood.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: '5rem' }}>
        <button
          onClick={() => {
            if (selectedMood) {
              fetch('/api/mood', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  mood: selectedMood,
                  date: new Date(currentTime * 1000).toLocaleDateString(),
                })
              });
            }
          }}>
          Submit
        </button>
      </div>
    </>
  )
}

export default App
