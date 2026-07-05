import React from 'react';
import type { Todo } from '../types/todo';
import { Edit, Trash2, Calendar, Check } from 'lucide-react';
import { getRelativeTime } from '../utils/time';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onEdit, onDelete }) => {
  return (
    <div className={`card todo-item ${todo.completed ? 'is-completed' : ''}`}>
      <div className="todo-item-main">
        <label className="checkbox-container" aria-label="Toggle completion status">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id, !todo.completed)}
          />
          <span className="checkbox-custom">
            <Check />
          </span>
        </label>

        <div className="todo-item-content">
          <h4 className={`todo-item-title ${todo.completed ? 'title-completed' : ''}`}>
            {todo.title}
          </h4>
          {todo.description && (
            <p className="todo-item-description">{todo.description}</p>
          )}
          <div className="todo-item-meta">
            <span className={`badge ${todo.completed ? 'badge-completed' : 'badge-pending'}`}>
              {todo.completed ? 'Completed' : 'Pending'}
            </span>
            <span className="todo-item-time" title={new Date(todo.createdAt).toLocaleString()}>
              <Calendar size={12} className="meta-icon" />
              {getRelativeTime(todo.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="todo-item-actions">
        <button
          type="button"
          className="btn btn-secondary btn-icon-only"
          onClick={() => onEdit(todo)}
          title="Edit Task"
          aria-label="Edit Task"
        >
          <Edit size={16} />
        </button>
        <button
          type="button"
          className="btn btn-danger btn-icon-only"
          onClick={() => onDelete(todo.id)}
          title="Delete Task"
          aria-label="Delete Task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
