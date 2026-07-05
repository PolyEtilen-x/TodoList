import React from 'react';
import { useApp } from '../../context/AppContext';
import './style.css';

interface FilterChipsProps {
  value: 'all' | 'pending' | 'completed';
  onChange: (value: 'all' | 'pending' | 'completed') => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ value, onChange }) => {
  const { t } = useApp();
  
  const options: { label: string; val: 'all' | 'pending' | 'completed' }[] = [
    { label: t('allTasks'), val: 'all' },
    { label: t('pending'), val: 'pending' },
    { label: t('completed'), val: 'completed' },
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
