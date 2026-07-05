import React from 'react';
import './style.css';

interface FilterChipsProps {
  value: 'all' | 'pending' | 'completed';
  onChange: (value: 'all' | 'pending' | 'completed') => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ value, onChange }) => {
  const options: { label: string; val: 'all' | 'pending' | 'completed' }[] = [
    { label: 'All Tasks', val: 'all' },
    { label: 'Pending', val: 'pending' },
    { label: 'Completed', val: 'completed' },
  ];

  return (
    <div className="filter-chips-container">
      {options.map((opt) => (
        <button
          key={opt.val}
          type="button"
          className={`filter-chip ${value === opt.val ? 'active' : ''}`}
          onClick={() => onChange(opt.val)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
