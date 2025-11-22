import MoodPicker from '../components/mood/MoodPicker';
import HistoryList from '../components/history/HistoryList';

const HistoryView = ({ pastEntries, loading, error, onMoodSelect, onDelete, onEdit, renderOnlyHeader = false }) => {
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
  <div className="history-header">
        <MoodPicker onMoodSelect={onMoodSelect} />
        <div className="history-date">
          <div className="history-date-text">
            {dateString} • {timeString}
          </div>
        </div>
      </div>
  {renderOnlyHeader ? null : (
      <HistoryList 
        entries={pastEntries} 
        loading={loading} 
        error={error} 
        onDelete={onDelete}
        onEdit={onEdit}
      />
  )}
    </>
  );
};

export default HistoryView;