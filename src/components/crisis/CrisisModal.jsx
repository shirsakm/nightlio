import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import catSupportGif from './cat-comfort.gif'; 

const CrisisModal = ({ open, onClose }) => {
  const [step, setStep] = useState('comfort'); 
  const [comfortIndex, setComfortIndex] = useState(0);
  const [inputs, setInputs] = useState({ sees: '', hears: '' });
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const comfortLines = [
    "Hey, it's gonna be ok.",
    "You'll get through it.",
    "Unclench your jaws.",
    "Relax your shoulders.",
    "Take a deep breath."
  ];

  // Logic: Sentences appear one by one with a key-triggered animation
  useEffect(() => {
    if (open && step === 'comfort') {
      if (comfortIndex < comfortLines.length) {
        const timer = setTimeout(() => {
          setComfortIndex(prev => prev + 1);
        }, 2500); // Matches the CSS animation timing
        return () => clearTimeout(timer);
      } else {
        setStep('input');
      }
    }
  }, [open, comfortIndex, step]);

  const handleSubmit = async () => {
    setLoading(true);
    setStep('result');
    try {
      const res = await fetch('/api/mood/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      setAiResponse(data.text);
    } catch (err) {
      setAiResponse("I'm here with you. Focus on your breathing for a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('comfort');
    setComfortIndex(0);
    setInputs({ sees: '', hears: '' });
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Take a Moment">
      <div style={{ textAlign: 'center', minHeight: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        <img 
          src={catSupportGif} 
          alt="Support" 
          style={{ 
            width: '150px', 
            height: 'auto', 
            borderRadius: '15px', 
            marginBottom: '20px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
          }} 
        />

        {step === 'comfort' && (
          <div style={{ minHeight: '60px' }}>
            <p 
              key={comfortIndex} // Re-triggers CSS animation
              className="comfort-text-fade" 
              style={{ fontSize: '1.4rem', fontWeight: '500', color: 'var(--fg-body)' }}
            >
              {comfortLines[comfortIndex]}
            </p>
          </div>
        )}

        {step === 'input' && (
          <div style={{ textAlign: 'left', width: '100%', animation: 'fadeIn 0.5s' }}>
            <p style={{ marginBottom: '8px' }}>What are 3 things you <strong>see</strong>?</p>
            <input 
              style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--fg-body)' }}
              value={inputs.sees}
              onChange={(e) => setInputs({...inputs, sees: e.target.value})}
              placeholder="e.g. My desk, the window, a pen"
            />
            <p style={{ marginBottom: '8px' }}>What are 3 things you <strong>hear</strong>?</p>
            <input 
              style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--fg-body)' }}
              value={inputs.hears}
              onChange={(e) => setInputs({...inputs, hears: e.target.value})}
              placeholder="e.g. The fan, birds, traffic"
            />
            <button className="primary-button" onClick={handleSubmit} style={{ width: '100%', padding: '12px' }}>
              OK
            </button>
          </div>
        )}

        {step === 'result' && (
          <div style={{ width: '100%', animation: 'fadeIn 0.5s' }}>
            <p style={{ fontSize: '1.1rem', fontStyle: 'italic', lineHeight: '1.6', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
              {loading ? "Thinking..." : aiResponse}
            </p>
            {!loading && (
              <button className="primary-button" onClick={handleClose} style={{ marginTop: '20px', width: '100%' }}>
                Okay
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CrisisModal;