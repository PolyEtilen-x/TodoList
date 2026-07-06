import React, { useState, useRef, useEffect } from 'react';
import type { Todo } from '../../types/todo';
import { Check, X, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './style.css';

interface TodoFormProps {
  initialTodo?: Todo | null;
  onSubmit: (title: string, description?: string) => Promise<void>;
  onCancel?: () => void;
  isPending: boolean;
}

export const TodoForm: React.FC<TodoFormProps> = ({ initialTodo, onSubmit, onCancel, isPending }) => {
  const { t, language } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState<boolean>(!!initialTodo);
  const [prevInitialTodoId, setPrevInitialTodoId] = useState<string | null>(initialTodo?.id || null);
  
  const titleInputRef = useRef<HTMLInputElement>(null);

  const currentInitialTodoId = initialTodo?.id || null;
  if (currentInitialTodoId !== prevInitialTodoId) {
    setTitle(initialTodo ? initialTodo.title : '');
    setDescription(initialTodo?.description || '');
    setError('');
    setIsExpanded(!!initialTodo);
    setPrevInitialTodoId(currentInitialTodoId);
  }

  useEffect(() => {
    if (isExpanded && !initialTodo && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isExpanded, initialTodo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError(language === 'vi' ? 'Tiêu đề là bắt buộc.' : 'Title is required.');
      return;
    }

    if (trimmedTitle.length > 200) {
      setError(language === 'vi' ? 'Tiêu đề không được quá 200 ký tự.' : 'Title must be 200 characters or less.');
      return;
    }

    if (description.length > 2000) {
      setError(language === 'vi' ? 'Mô tả không được quá 2000 ký tự.' : 'Description must be 2000 characters or less.');
      return;
    }

    try {
      await onSubmit(trimmedTitle, description.trim() || undefined);
      if (!initialTodo) {
        setTitle('');
        setDescription('');
        setIsExpanded(false);
      }
    } catch (err: unknown) {
      setError((err as Error).message || t('toastCreateError'));
    }
  };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    }
    if (!initialTodo) {
      setIsExpanded(false);
      setTitle('');
      setDescription('');
      setError('');
    }
  };

  if (!isExpanded && !initialTodo) {
    return (
      <button 
        type="button" 
        className="quick-add-trigger" 
        onClick={() => setIsExpanded(true)}
      >
        <Plus size={20} className="quick-add-icon" />
        <span>{t('createNewTask')}</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card todo-form">
      <h3 className="form-title">
        {initialTodo ? t('editTask') : t('createNewTask')}
      </h3>
      
      <div className="form-group">
        <label className="form-label" htmlFor="todo-title">
          {t('taskTitle')} <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <input
          id="todo-title"
          ref={titleInputRef}
          type="text"
          className={`input ${error && !title.trim() ? 'input-error' : ''}`}
          placeholder="E.g., Complete project documentation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="todo-desc">
          {t('description')}
        </label>
        <textarea
          id="todo-desc"
          className="input textarea"
          placeholder="E.g., Outline the design decisions and API documentation..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isPending}
        />
      </div>

      {error && <p className="form-error-msg">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={handleCancelClick} disabled={isPending}>
          <X size={16} /> {t('cancel')}
        </button>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          <Check size={16} /> {isPending ? (initialTodo ? t('saving') : t('adding')) : (initialTodo ? t('saveChanges') : t('addTask'))}
        </button>
      </div>
    </form>
  );
};
