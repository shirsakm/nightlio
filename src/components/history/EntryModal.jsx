import ReactMarkdown from 'react-markdown';
import { useEffect } from 'react';

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
};

const panelStyle = {
  width: 'min(820px, 92vw)',
  maxHeight: '85vh',
  overflow: 'auto',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  boxShadow: 'var(--shadow-lg)',
  padding: '20px',
};

const deriveTitleBody = (content = '') => {
  const text = (content || '').replace(/\r\n/g, '\n').trim();
  if (!text) return { title: '', body: '' };
  const lines = text.split('\n');
  const first = (lines[0] || '').trim();
  // If first line is a markdown heading like # Title
  const heading = first.match(/^#{1,6}\s+(.+?)\s*$/);
  if (heading) {
    return { title: heading[1].trim(), body: lines.slice(1).join('\n').trim() };
  }
  // Otherwise, multi-line: first line as title, remainder as body
  if (lines.length > 1) {
    return { title: first, body: lines.slice(1).join('\n').trim() };
  }
  // Single-line content; split at first space into title + body
  const idx = first.indexOf(' ');
  if (idx > 0) {
    return { title: first.slice(0, idx).trim(), body: first.slice(idx + 1).trim() };
  }
  // Single word only
  return { title: first, body: '' };
};

const EntryModal = ({ isOpen, entry, onClose, onDelete, isDeleting, onEdit }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (typeof onClose === 'function') onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);
  
  if (!isOpen || !entry) return null;
  
  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  const { title, body } = deriveTitleBody(entry.content);
  return (
    <div style={backdropStyle} onClick={onBackdrop} role="dialog" aria-modal="true">
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{entry.date}</div>
            {entry.created_at && (
              <div style={{ fontSize: '0.85rem', color: 'color-mix(in oklab, var(--text), transparent 30%)' }}>
                {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                disabled={isDeleting}
                style={{
                  background: 'var(--accent-bg)',
                  color: '#fff',
                  border: '1px solid var(--accent-bg)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-sm)'
                }}
                aria-label="Edit entry"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                disabled={isDeleting}
                style={{
                  background: 'var(--danger)',
                  color: '#fff',
                  border: '1px solid var(--danger)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-sm)'
                }}
                aria-label="Delete entry"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </div>
        </div>
        {title && (
          <div className="history-markdown" style={{ marginBottom: 8 }}>
            <h1 style={{ margin: 0 }}>{title}</h1>
          </div>
        )}
        {entry.selections?.length > 0 && (
          <div className="tag-list" style={{ marginBottom: 12 }}>
            {entry.selections.map((s) => (
              <span key={s.id} className="tag">{s.name}</span>
            ))}
          </div>
        )}
        <div className="history-markdown">
          <ReactMarkdown>{body}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default EntryModal;