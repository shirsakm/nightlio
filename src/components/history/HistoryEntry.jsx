import { useState } from 'react';
import { Trash } from 'lucide-react';
import { getMoodIcon } from '../../utils/moodUtils';
import apiService from '../../services/api';
import { useToast } from '../ui/ToastProvider';
import EntryModal from './EntryModal';

const HistoryEntry = ({ entry, onDelete }) => {
  const { icon: IconComponent, color } = getMoodIcon(entry.mood);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [open, setOpen] = useState(false);

  // derive a simple title and excerpt from markdown
  const stripMd = (s = '') => s
    .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^\)]*\)/g, '$1')
    .replace(/^[#>*\-+]+\s?/gm, '')
    .replace(/[*_~`>#\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const plain = stripMd(entry.content || '');
  const title = plain.slice(0, 80);
  const excerpt = plain.slice(80, 420);

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

  const openPreview = () => setOpen(true);
  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPreview();
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="entry-card"
      role="button"
      tabIndex={0}
      onClick={openPreview}
      onKeyDown={onKey}
      aria-label={`Open entry from ${entry.date}`}
      style={{
        border: isHovered ? '1px solid color-mix(in oklab, var(--accent-600), transparent 55%)' : '1px solid var(--border)',
        boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        cursor: 'pointer',
        outline: 'none'
      }}
    >
      {/* Delete Button */}
      {isHovered && (
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          disabled={isDeleting}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: isDeleting ? 'color-mix(in oklab, var(--text), transparent 60%)' : 'var(--danger)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: 0.9,
            boxShadow: 'var(--shadow-sm)',
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
          <Trash size={24} strokeWidth={2.4} />
        </button>
      )}

      {/* Thumbnail placeholder with mood icon */}
      <div className="entry-thumb" style={{
        height: 120,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent-600) 16%, transparent), color-mix(in oklab, var(--accent-600) 6%, transparent))',
        border: '1px solid var(--border)',
        marginBottom: 12
      }}>
        <span style={{ color, display: 'flex', alignItems: 'center' }}>
          <IconComponent size={28} strokeWidth={1.8} />
        </span>
      </div>

      <div style={{
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
          <IconComponent size={20} strokeWidth={1.5} />
        </span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span
            style={{
              fontWeight: '600',
        color: 'var(--text)',
              fontSize: '1.1rem',
            }}
          >
            {entry.date}
          </span>
          {entry.created_at && (
      <span
              style={{
        fontSize: '0.95rem',
        color: 'color-mix(in oklab, var(--text), transparent 30%)',
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

      {/* Title + excerpt preview */}
      <div className="entry-card__title">{title || 'Entry'}</div>
      {excerpt && (
        <div className="entry-card__excerpt">{excerpt}</div>
      )}

      {/* Modal for full view */}
      <EntryModal isOpen={open} entry={entry} onClose={() => setOpen(false)} />
    </div>
  );
};

export default HistoryEntry;