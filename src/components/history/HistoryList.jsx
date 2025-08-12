import HistoryEntry from './HistoryEntry';

const HistoryList = ({ entries, loading, error }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
        Loading your mood history...
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
        No entries yet. Select a mood above to create your first entry!
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'left', marginTop: '2rem' }}>
      {entries.map(entry => (
        <HistoryEntry key={entry.id || entry.date} entry={entry} />
      ))}
    </div>
  );
};

export default HistoryList;