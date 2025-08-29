import { Search } from 'lucide-react';

const SearchPlaceholder = () => {
  return (
    <div
      className="search-placeholder"
      role="search"
      aria-label="Search"
      title="Search entries…"
      id="global-search"
    >
      <Search size={16} strokeWidth={2} aria-hidden="true" />
      <input
        className="search-placeholder__input"
        type="text"
        readOnly
        placeholder="Search entries… (Press / to focus)"
        aria-readonly="true"
        id="global-search-input"
      />
      <kbd className="search-placeholder__hint">/</kbd>
    </div>
  );
};

export default SearchPlaceholder;
