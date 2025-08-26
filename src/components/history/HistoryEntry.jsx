import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Trash2 } from 'lucide-react';
import { getMoodIcon } from '../../utils/moodUtils';
import apiService from '../../services/api';
import { useToast } from '../ui/ToastProvider';

const HistoryEntry = ({ entry, onDelete }) => {
  const { icon: IconComponent, color } = getMoodIcon(entry.mood);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { show } = useToast();
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiService.deleteMoodEntry(entry.id);
      onDelete(entry.id);
  show('Entry deleted', 'success');
    } catch (error) {
      console.error('Failed to delete entry:', error);
  show('Failed to delete entry. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="entry-card"
      style={{
        border: isHovered ? '1px solid var(--accent-200)' : '1px solid var(--border)',
        boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)'
      }}
    >
      {/* Delete Button */}
      {isHovered && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: isDeleting ? '#ccc' : '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: 0.9,
            boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.target.style.opacity = '1';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '0.9';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <Trash2 size={18} strokeWidth={2} />
        </button>
      )}

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
              color: 'var(--accent-600)',
              fontSize: '1.1rem',
            }}
          >
            {entry.date}
          </span>
          {entry.created_at && (
            <span
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
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
                className="tag"
              >
                {selection.name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div
        style={{
          color: 'var(--text)',
          lineHeight: '1.6',
          textAlign: 'left',
        }}
      >
        <ReactMarkdown 
          className="history-markdown"
          components={{
            p: ({children}) => <p style={{textAlign: 'left', margin: '0.5rem 0'}}>{children}</p>,
            h1: ({children}) => <h1 style={{textAlign: 'left'}}>{children}</h1>,
            h2: ({children}) => <h2 style={{textAlign: 'left'}}>{children}</h2>,
            h3: ({children}) => <h3 style={{textAlign: 'left'}}>{children}</h3>,
            ul: ({children}) => <ul style={{textAlign: 'left', paddingLeft: '1.5rem'}}>{children}</ul>,
            ol: ({children}) => <ol style={{textAlign: 'left', paddingLeft: '1.5rem'}}>{children}</ol>,
          }}
        >
          {entry.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default HistoryEntry;