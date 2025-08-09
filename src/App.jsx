import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    fetch('/api/time')
      .then(response => response.json())
      .then(data => {
        setCurrentTime(data.time);
      })
    }, []);

  return (
    <>
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
      <div>
        
      </div>
    </>
  )
}

export default App
