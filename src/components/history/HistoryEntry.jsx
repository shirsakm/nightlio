import ReactMarkdown from 'react-markdown';
import { getMoodIcon } from '../../utils/moodUtils';

const HistoryEntry = ({ entry }) => {
  const { icon: IconComponent, color } = getMoodIcon(entry.mood);

  return (
    <div
      style={{
        border: 'none',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '0.5rem',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            color,
          }}
        >
          <IconComponent size={24} strokeWidth={1.5} />
        </span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontWeight: '600',
              color: '#667eea',
              fontSize: '1.1rem',
            }}
          >
            {entry.date}
          </span>
          {entry.created_at && (
            <span
              style={{
                fontSize: '0.9rem',
                color: '#999',
                fontWeight: '400',
              }}
            >
              {new Date(entry.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          )}
        </div>
      </div>
      
      {/* Display selected options */}
      {entry.selections && entry.selections.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            {entry.selections.map(selection => (
              <span
                key={selection.id}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                }}
              >
                {selection.name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div
        style={{
          color: '#2E3440',
          lineHeight: '1.6',
        }}
      >
        <ReactMarkdown className="history-markdown">
          {entry.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default HistoryEntry;