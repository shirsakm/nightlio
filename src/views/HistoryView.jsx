import { useState } from 'react';
import MoodPicker from '../components/mood/MoodPicker';
import HistoryList from '../components/history/HistoryList';
import SearchBar from '../components/search/SearchBar';

const HistoryView = ({ pastEntries, loading, error, onMoodSelect, onDelete, onEdit, renderOnlyHeader = false }) => {
  const [searchQuery, setSearchQuery] = useState('');  // Track search text
  const [filteredEntries, setFilteredEntries] = useState(pastEntries);
  
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

  const handleSearch = (results) => {
    setFilteredEntries(results.length > 0 ? results : pastEntries);
    // If no results found, show all entries
    // This way pressing X button shows all entries again
  };

  return (
    <>
      <div className="history-header">
        <MoodPicker onMoodSelect={onMoodSelect} />
        <div className="history-date">
          <h2 className="history-today-title">Today</h2>
          <div className="history-datetime-group">
            <span className="history-date-part">{dateString}</span>
            <span className="history-time-part">{timeString}</span>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: '2rem', marginTop: '1.5rem' }}>
        <SearchBar
          entries={pastEntries}
          onSearch={handleSearch}
          placeholder="Search your entries... (date or content)"
          searchFields={['content', 'date']}
        />
      </div>

      {renderOnlyHeader ? null : (
        <HistoryList 
          entries={filteredEntries}
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