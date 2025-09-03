const GroupSelector = ({ groups, selectedOptions, onOptionToggle }) => {
  if (!groups.length) return null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      {groups.map(group => (
    <div
          key={group.id}
          style={{
            marginBottom: '1.5rem',
      background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '1.5rem',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--border)',
          }}
        >
          <h3
            style={{
              margin: '0 0 1rem 0',
              color: 'var(--accent-600)',
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
            ? '2px solid var(--accent-600)' 
            : '2px solid var(--border)',
      background: selectedOptions.includes(option.id)
    ? 'linear-gradient(135deg, var(--accent-bg), var(--accent-bg-2))'
            : 'var(--surface)',
          color: selectedOptions.includes(option.id) ? 'white' : 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: selectedOptions.includes(option.id) ? '600' : '500',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedOptions.includes(option.id)
                    ? 'var(--shadow-md)'
                    : 'var(--shadow-sm)',
                  transform: selectedOptions.includes(option.id) ? 'translateY(-1px)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!selectedOptions.includes(option.id)) {
                    e.target.style.borderColor = 'var(--accent-600)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedOptions.includes(option.id)) {
                    e.target.style.borderColor = 'var(--border)';
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