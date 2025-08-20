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
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
          }}
        >
          <h3
            style={{
              margin: '0 0 1rem 0',
              color: '#667eea',
              fontSize: '1rem',
              fontWeight: '500',
              letterSpacing: '0.5px',
            }}
          >
            {group.name}
          </h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            {group.options.map(option => (
              <button
                key={option.id}
                onClick={() => onOptionToggle(option.id)}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '25px',
                  border: selectedOptions.includes(option.id) 
                    ? '2px solid #667eea' 
                    : '2px solid #e0e0e0',
                  background: selectedOptions.includes(option.id)
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : '#ffffff',
                  color: selectedOptions.includes(option.id) ? 'white' : '#555',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: selectedOptions.includes(option.id) ? '600' : '500',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedOptions.includes(option.id)
                    ? '0 4px 15px rgba(102, 126, 234, 0.25)'
                    : '0 2px 8px rgba(0, 0, 0, 0.05)',
                  transform: selectedOptions.includes(option.id) ? 'translateY(-1px)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!selectedOptions.includes(option.id)) {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedOptions.includes(option.id)) {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.transform = 'none';
                  }
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