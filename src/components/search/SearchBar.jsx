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
      if (onSearch) onSearch(null); // Return null when search is cleared
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
    </div>
  );
}