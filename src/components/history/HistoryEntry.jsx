import { useState } from 'react';
import { getMoodIcon } from '../../utils/moodUtils';
import apiService from '../../services/api';
import { useToast } from '../ui/ToastProvider';
import EntryModal from './EntryModal';

const HistoryEntry = ({ entry, onDelete }) => {
  const { icon: IconComponent, color } = getMoodIcon(entry.mood);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [open, setOpen] = useState(false);

  // helpers to split title/body and strip markdown for previews
  const stripMd = (s = '') => s
    .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ')
    .replace(/\[(.*?)\]\([^\)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[>\-+*]\s+/gm, '')
    .replace(/[*_~`>#\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const splitTitleBody = (content = '') => {
    const text = (content || '').replace(/\r\n/g, '\n').trim();
    if (!text) return { title: '', body: '' };
    const lines = text.split('\n');
    const first = (lines[0] || '').trim();
    const heading = first.match(/^#{1,6}\s+(.+?)\s*$/);
    if (heading) {
      return { title: heading[1].trim(), body: lines.slice(1).join('\n').trim() };
    }
    if (lines.length > 1) {
      return { title: first, body: lines.slice(1).join('\n').trim() };
    }
    const idx = first.indexOf(' ');
    if (idx > 0) {
      return { title: first.slice(0, idx).trim(), body: first.slice(idx + 1).trim() };
    }
    return { title: first, body: '' };
  };

  const { title: rawTitle, body: rawBody } = splitTitleBody(entry.content || '');
  const title = stripMd(rawTitle).slice(0, 80);
  const excerpt = stripMd(rawBody).slice(0, 420);

  const { show } = useToast();
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return false;
    setIsDeleting(true);
    try {
      await apiService.deleteMoodEntry(entry.id);
      onDelete(entry.id);
      show('Entry deleted', 'success');
      return true;
    } catch (error) {
      console.error('Failed to delete entry:', error);
      show('Failed to delete entry. Please try again.', 'error');
      return false;
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
      {/* Header: mood icon + date • time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
  <span style={{ color, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-bg-softer)', border: '1px solid var(--border)' }}>
          <IconComponent size={18} strokeWidth={1.8} />
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: 'var(--text)' }}>{entry.date}</span>
          {entry.created_at && (
            <>
              <span aria-hidden="true" style={{ color: 'color-mix(in oklab, var(--text), transparent 40%)' }}>•</span>
              <span style={{ color: 'color-mix(in oklab, var(--text), transparent 20%)' }}>
                {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Title + excerpt preview */}
      <div className="entry-card__title">{title || 'Entry'}</div>
      {excerpt && (
        <div className="entry-card__excerpt">{excerpt}</div>
      )}

      {/* Tags at the bottom */}
      {entry.selections && entry.selections.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {entry.selections.map(selection => (
              <span key={selection.id} className="tag">{selection.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Modal for full view */}
      <EntryModal
        isOpen={open}
        entry={entry}
        onClose={() => setOpen(false)}
        onDelete={async () => {
          const ok = await handleDelete();
          if (ok) setOpen(false);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default HistoryEntry;