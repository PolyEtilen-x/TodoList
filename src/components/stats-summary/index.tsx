import React from 'react';
import type { TodoStats } from '../../types/todo';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './style.css';

interface StatsSummaryProps {
  stats?: TodoStats;
  isLoading: boolean;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ stats, isLoading }) => {
  const { t } = useApp();

  if (isLoading || !stats) {
    return (
      <div className="stats-container">
        <div className="stats-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card skeleton stats-skeleton-card"></div>
          ))}
        </div>
        <div className="stats-progress-container skeleton" style={{ height: '48px', marginTop: 'var(--space-16)' }}></div>
      </div>
    );
  }

  const completionRate = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  return (
    <div className="stats-container">
      <div className="stats-grid">
        <div className="card stats-card">
          <div className="stats-icon-wrapper total">
            <ListTodo size={22} />
          </div>
          <div className="stats-info">
            <p className="stats-label">{t('totalTasks')}</p>
            <h3 className="stats-value">{stats.total}</h3>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon-wrapper pending">
            <Circle size={22} />
          </div>
          <div className="stats-info">
            <p className="stats-label">{t('pending')}</p>
            <h3 className="stats-value">{stats.pending}</h3>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon-wrapper completed">
            <CheckCircle2 size={22} />
          </div>
          <div className="stats-info">
            <p className="stats-label">{t('completed')}</p>
            <h3 className="stats-value">{stats.completed}</h3>
          </div>
        </div>
      </div>

      <div className="card stats-progress-container">
        <div className="stats-progress-header">
          <span className="stats-progress-label">{t('completionRate')}</span>
          <span className="stats-progress-value">{completionRate}%</span>
        </div>
        <div className="stats-progress-track">
          <div 
            className="stats-progress-fill" 
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};
