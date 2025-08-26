import HistoryEntry from './HistoryEntry';
import Skeleton from '../ui/Skeleton';
import { useToast } from '../ui/ToastProvider';

const HistoryList = ({ entries, loading, error, onDelete }) => {
  const { show } = useToast();
  if (loading) {
    return (
      <div style={{ textAlign: 'left', padding: '1rem 0' }}>
        <Skeleton height={28} width={220} style={{ marginBottom: 12 }} />
        {[1,2,3].map((i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <Skeleton height={140} radius={16} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', color: '#ff6b6b', padding: '2rem' }}>
        {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#4C566A', padding: '2rem' }}>
        <p style={{ marginBottom: 12 }}>No entries yet.</p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('nightlio:new-entry'))}
          style={{
            padding: '0.6rem 1rem',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}
        >
          Create first entry
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'left', marginTop: '2rem' }}>
      {entries.map(entry => (
  <HistoryEntry 
          key={entry.id || entry.date} 
          entry={entry} 
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default HistoryList;