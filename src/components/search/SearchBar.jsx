import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({ 
  entries = [],
  onSearch,
  placeholder = "Search entries...",
  searchFields = ['content', 'date']  // Which fields to search
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  // Real-time search as user types
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const queryLower = query.toLowerCase();
    
    // Filter entries by search query
    const filtered = entries.filter(entry => {
      // Search in specified fields
      return searchFields.some(field => {
        const value = entry[field];
        if (!value) return false;
        return String(value).toLowerCase().includes(queryLower);
      });
    });

    setResults(filtered);
    setIsOpen(true);
    
    // Callback to parent component
    if (onSearch) {
      onSearch(filtered);
    }
  }, [query, entries, searchFields, onSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-bar-container" ref={searchRef}>
      <div className="search-bar-input-wrapper">
        <Search size={18} className="search-bar-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="search-bar-input"
        />
        {query && (
          <button
            className="search-bar-clear"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dropdown with results */}
      {isOpen && results.length > 0 && (
        <div className="search-bar-dropdown">
          <div className="search-bar-results-header">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </div>
          <ul className="search-bar-results">
            {results.slice(0, 5).map((entry) => (
              <li key={entry.id} className="search-bar-result-item">
                <div className="search-bar-result-date">
                  {entry.date}
                </div>
                <div className="search-bar-result-preview">
                  {/* Show mood emoji + preview of content */}
                  {entry.content.substring(0, 60)}...
                </div>
              </li>
            ))}
            {results.length > 5 && (
              <li className="search-bar-result-more">
                +{results.length - 5} more results
              </li>
            )}
          </ul>
        </div>
      )}

      {/* No results */}
      {isOpen && query && results.length === 0 && (
        <div className="search-bar-no-results">
          No entries found matching "{query}"
        </div>
      )}
    </div>
  );
}