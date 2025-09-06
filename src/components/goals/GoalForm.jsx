import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const GoalForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: '3 days a week'
  });

  const [errors, setErrors] = useState({});

  const frequencyOptions = [
    '1 day a week',
    '2 days a week', 
    '3 days a week',
    '4 days a week',
    '5 days a week',
    '6 days a week',
    '7 days a week'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <button
        onClick={onCancel}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.95rem'
        }}
        onMouseEnter={(e) => e.target.style.background = 'var(--accent-bg-softer)'}
        onMouseLeave={(e) => e.target.style.background = 'none'}
      >
        <ArrowLeft size={16} />
        Back to Goals
      </button>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500', 
            color: 'var(--text)',
            fontSize: '0.95rem'
          }}>
            Goal Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Morning Meditation, Evening Walk, Read Before Bed"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.title ? 'var(--error)' : 'var(--border)'}`,
              borderRadius: '8px',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              if (!errors.title) e.target.style.borderColor = 'var(--accent-600)';
            }}
            onBlur={(e) => {
              if (!errors.title) e.target.style.borderColor = 'var(--border)';
            }}
          />
          {errors.title && (
            <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginTop: '4px' }}>
              {errors.title}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500', 
            color: 'var(--text)',
            fontSize: '0.95rem'
          }}>
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your goal and why it's important to you..."
            rows={4}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.description ? 'var(--error)' : 'var(--border)'}`,
              borderRadius: '8px',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '1rem',
              outline: 'none',
              resize: 'vertical',
              minHeight: '100px',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              if (!errors.description) e.target.style.borderColor = 'var(--accent-600)';
            }}
            onBlur={(e) => {
              if (!errors.description) e.target.style.borderColor = 'var(--border)';
            }}
          />
          {errors.description && (
            <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginTop: '4px' }}>
              {errors.description}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500', 
            color: 'var(--text)',
            fontSize: '0.95rem'
          }}>
            Frequency
          </label>
          <select
            value={formData.frequency}
            onChange={(e) => handleInputChange('frequency', e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '1rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {frequencyOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px 24px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--accent-bg-softer)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--surface)'}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="primary"
            style={{
              flex: 1,
              padding: '12px 24px',
              fontSize: '1rem'
            }}
          >
            Create Goal
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalForm;
