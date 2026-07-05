import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './style.css';

interface SearchBarProps {
  value: string;
  onSearch: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onSearch }) => {
  const { t } = useApp();
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setLocalValue(value);
    setPrevValue(value);
  }

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
        placeholder={t('searchPlaceholder')}
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
