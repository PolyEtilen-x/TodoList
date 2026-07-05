import React from 'react';
import type { TodoStats } from '../types/todo';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';

interface StatsSummaryProps {
  stats?: TodoStats;
  isLoading: boolean;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="stats-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card skeleton stats-skeleton-card"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-grid">
      <div className="card stats-card">
        <div className="stats-icon-wrapper total">
          <ListTodo size={22} />
        </div>
        <div className="stats-info">
          <p className="stats-label">Total Tasks</p>
          <h3 className="stats-value">{stats.total}</h3>
        </div>
      </div>

      <div className="card stats-card">
        <div className="stats-icon-wrapper pending">
          <Circle size={22} />
        </div>
        <div className="stats-info">
          <p className="stats-label">Pending</p>
          <h3 className="stats-value">{stats.pending}</h3>
        </div>
      </div>

      <div className="card stats-card">
        <div className="stats-icon-wrapper completed">
          <CheckCircle2 size={22} />
        </div>
        <div className="stats-info">
          <p className="stats-label">Completed</p>
          <h3 className="stats-value">{stats.completed}</h3>
        </div>
      </div>
    </div>
  );
};
