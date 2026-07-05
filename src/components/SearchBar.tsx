import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onSearch: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onSearch }) => {
  const [localValue, setLocalValue] = useState(value);

  // Keep local state in sync if prop changes from outside
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce input value changes by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(localValue);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, onSearch]);

  return (
    <div className="search-bar-container">
      <Search className="search-icon" size={18} />
      <input
        type="text"
        className="input search-input"
        placeholder="Search tasks by title or description..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      {localValue && (
        <button 
          type="button" 
          className="search-clear-btn" 
          onClick={() => setLocalValue('')}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
