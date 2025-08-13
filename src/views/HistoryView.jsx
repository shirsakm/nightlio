import MoodPicker from '../components/mood/MoodPicker';
import HistoryList from '../components/history/HistoryList';

const HistoryView = ({ pastEntries, loading, error, onMoodSelect }) => {
  return (
    <>
      <MoodPicker onMoodSelect={onMoodSelect} />
      <HistoryList entries={pastEntries} loading={loading} error={error} />
    </>
  );
};

export default HistoryView;