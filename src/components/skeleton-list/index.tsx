import React from 'react';
import './style.css';

interface SkeletonListProps {
  count?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ count = 3 }) => {
  return (
    <div className="skeleton-list-container">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card skeleton todo-item-skeleton"></div>
      ))}
    </div>
  );
};
