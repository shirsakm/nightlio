import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Disc } from 'lucide-react';

const MusicDock = () => {
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const handlePlay = (e) => {
      setTrack(e.detail);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = e.detail.audio_url;
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    };

    window.addEventListener('playMoodMusic', handlePlay);
    return () => window.removeEventListener('playMoodMusic', handlePlay);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || !track) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setTrack(null);
    setIsPlaying(false);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '300px',
        backgroundColor: 'rgba(15, 15, 15, 0.9)',
        backdropFilter: 'blur(12px)',
        borderRadius: '20px',
        border: `1px solid ${track ? track.color : '#333'}`,
        boxShadow: track ? `0 8px 32px -8px ${track.color}66` : '0 8px 32px rgba(0,0,0,0.5)',
        padding: '16px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Spinning Disc */}
      <div style={{ 
        color: track ? track.color : '#444',
        animation: isPlaying ? 'spin 3s linear infinite' : 'none',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Disc size={32} />
      </div>

      {/* Info Section */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ 
          color: track ? 'white' : '#666', 
          fontWeight: 'bold', 
          fontSize: '13px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {track ? track.track_name : "No vibe detected"}
        </div>
        <div style={{ color: '#888', fontSize: '11px' }}>
          {track ? track.artist : "Select a mood"}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {track && (
          <>
            <button 
              onClick={togglePlay}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: '4px' }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button 
              onClick={stopMusic}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4d', padding: '4px' }}
            >
              <Square size={18} fill="#ff4d4d" />
            </button>
          </>
        )}
      </div>

      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MusicDock;