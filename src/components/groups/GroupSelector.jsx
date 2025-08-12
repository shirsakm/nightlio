const GroupSelector = ({ groups, selectedOptions, onOptionToggle }) => {
  if (!groups.length) return null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      {groups.map(group => (
        <div
          key={group.id}
          style={{
            marginBottom: '1.5rem',
            background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          <h3
            style={{
              margin: '0 0 1rem 0',
              color: '#333',
              fontSize: '1.1rem',
              fontWeight: '600',
            }}
          >
            {group.name}
          </h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            {group.options.map(option => (
              <button
                key={option.id}
                onClick={() => onOptionToggle(option.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: 'none',
                  background: selectedOptions.includes(option.id)
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                  color: selectedOptions.includes(option.id) ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedOptions.includes(option.id)
                    ? '0 4px 15px rgba(102, 126, 234, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupSelector;