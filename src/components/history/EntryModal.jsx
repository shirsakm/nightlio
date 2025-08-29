import ReactMarkdown from 'react-markdown';

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

const EntryModal = ({ isOpen, entry, onClose }) => {
  if (!isOpen || !entry) return null;
  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return (
    <div style={backdropStyle} onClick={onBackdrop} role="dialog" aria-modal="true">
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{entry.date}</div>
            {entry.created_at && (
              <div style={{ fontSize: '0.85rem', color: 'color-mix(in oklab, var(--text), transparent 30%)' }}>
                {new Date(entry.created_at).toLocaleString()}
              </div>
            )}
          </div>
          <button className="primary" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>
        {entry.selections?.length > 0 && (
          <div className="tag-list" style={{ marginBottom: 12 }}>
            {entry.selections.map((s) => (
              <span key={s.id} className="tag">{s.name}</span>
            ))}
          </div>
        )}
        <div className="history-markdown">
          <ReactMarkdown>{entry.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default EntryModal;