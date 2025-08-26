import MoodPicker from '../components/mood/MoodPicker';
import HistoryList from '../components/history/HistoryList';

const HistoryView = ({ pastEntries, loading, error, onMoodSelect, onDelete }) => {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Today</h2>
        <button
          onClick={() => onMoodSelect('neutral')}
          className="primary"
        >
          New Entry
        </button>
      </div>
      <MoodPicker onMoodSelect={onMoodSelect} />
      <HistoryList 
        entries={pastEntries} 
        loading={loading} 
        error={error} 
        onDelete={onDelete}
      />
    </>
  );
};

export default HistoryView;