import HistoryEntry from './HistoryEntry';
import AddEntryCard from './AddEntryCard';
import Skeleton from '../ui/Skeleton';

const HistoryList = ({ entries, loading, error, onDelete, onEdit }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'left', padding: '1rem 0' }}>
        <Skeleton height={28} width={220} style={{ marginBottom: 12 }} />
        <div className="card-grid">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i}>
              <Skeleton height={220} radius={16} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--accent-600)', padding: '2rem' }}>
        {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
        <p style={{ marginBottom: 12 }}>No entries yet.</p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('nightlio:new-entry'))}
          className="primary"
        >
          Create first entry
        </button>
        <div className="card-grid" style={{ marginTop: '1rem' }}>
          <AddEntryCard />
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'left', marginTop: 0 }}>
      <div className="card-grid">
        <AddEntryCard />
        {entries.map(entry => (
          <HistoryEntry 
            key={entry.id || entry.date} 
            entry={entry} 
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default HistoryList;