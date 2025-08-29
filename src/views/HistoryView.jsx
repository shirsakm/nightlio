import MoodPicker from '../components/mood/MoodPicker';
import HistoryList from '../components/history/HistoryList';

const HistoryView = ({ pastEntries, loading, error, onMoodSelect, onDelete, renderOnlyHeader = false }) => {
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeString = currentDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <MoodPicker onMoodSelect={onMoodSelect} />
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0, color: 'var(--text)', fontSize: '1.25rem', lineHeight: '1.2' }}>Today</h2>
          <div style={{ color: 'var(--text)', opacity: 0.9, fontSize: '0.8rem', marginTop: '0.125rem', lineHeight: '1.2' }}>
            {dateString}
          </div>
          <div style={{ color: 'var(--text)', opacity: 0.7, fontSize: '0.75rem', marginTop: '0.0625rem', lineHeight: '1.2' }}>
            {timeString}
          </div>
        </div>
      </div>
  {renderOnlyHeader ? null : (
      <HistoryList 
        entries={pastEntries} 
        loading={loading} 
        error={error} 
        onDelete={onDelete}
      />
  )}
    </>
  );
};

export default HistoryView;