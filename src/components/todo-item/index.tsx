import React, { useState, useRef, useEffect } from 'react';
import type { Todo } from '../../types/todo';
import { Edit, Trash2, Calendar, Check, MoreHorizontal, Star, Clock } from 'lucide-react';
import { getRelativeTime, formatExecutionTime } from '../../utils/time';
import { useApp } from '../../context/AppContext';
import './style.css';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onToggleImportant: (id: string, isImportant: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onToggleImportant,
  onEdit,
  onDelete,
}) => {
  const { t, language } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [menuOpen]);

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
              {todo.completed ? t('completed') : t('pending')}
            </span>
            <span className="todo-item-time" title={new Date(todo.createdAt).toLocaleString()}>
              <Calendar size={12} className="meta-icon" />
              {getRelativeTime(todo.createdAt)}
            </span>
            {todo.startTime && (
              <span className="todo-item-execution-time" title={language === 'vi' ? 'Thời gian thực hiện' : 'Execution time'}>
                <Clock size={12} className="meta-icon" />
                {formatExecutionTime(todo.startTime, todo.endTime, language)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="todo-item-actions" ref={menuRef}>
        <button
          type="button"
          className={`btn-star ${todo.isImportant ? 'is-starred' : ''}`}
          onClick={() => onToggleImportant(todo.id, !todo.isImportant)}
          title={todo.isImportant ? (language === 'vi' ? 'Bỏ đánh dấu quan trọng' : 'Remove important') : (language === 'vi' ? 'Đánh dấu quan trọng' : 'Mark as important')}
          aria-label="Star Important"
        >
          <Star size={18} fill={todo.isImportant ? 'var(--warning)' : 'none'} />
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-icon-only menu-trigger"
          onClick={() => setMenuOpen(!menuOpen)}
          title="Actions Menu"
          aria-label="Actions Menu"
          aria-expanded={menuOpen}
        >
          <MoreHorizontal size={18} />
        </button>

        {menuOpen && (
          <div className="todo-menu-dropdown card">
            <button
              type="button"
              className="menu-item"
              onClick={() => {
                onEdit(todo);
                setMenuOpen(false);
              }}
            >
              <Edit size={14} /> {t('editTask')}
            </button>
            <button
              type="button"
              className="menu-item delete"
              onClick={() => {
                onDelete(todo.id);
                setMenuOpen(false);
              }}
            >
              <Trash2 size={14} /> {t('deleteTask')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
