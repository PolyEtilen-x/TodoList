import React, { useState } from 'react';
import type { Todo } from '../types/todo';
import { Check, X } from 'lucide-react';

interface TodoFormProps {
  initialTodo?: Todo | null;
  onSubmit: (title: string, description?: string) => Promise<void>;
  onCancel?: () => void;
  isPending: boolean;
}

export const TodoForm: React.FC<TodoFormProps> = ({ initialTodo, onSubmit, onCancel, isPending }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [prevInitialTodoId, setPrevInitialTodoId] = useState<string | null>(initialTodo?.id || null);

  const currentInitialTodoId = initialTodo?.id || null;
  if (currentInitialTodoId !== prevInitialTodoId) {
    setTitle(initialTodo ? initialTodo.title : '');
    setDescription(initialTodo?.description || '');
    setError('');
    setPrevInitialTodoId(currentInitialTodoId);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }

    if (trimmedTitle.length > 200) {
      setError('Title must be 200 characters or less.');
      return;
    }

    if (description.length > 2000) {
      setError('Description must be 2000 characters or less.');
      return;
    }

    try {
      await onSubmit(trimmedTitle, description.trim() || undefined);
      if (!initialTodo) {
        setTitle('');
        setDescription('');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to submit task.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card todo-form">
      <h3 className="form-title">
        {initialTodo ? 'Edit Task' : 'Create New Task'}
      </h3>
      
      <div className="form-group">
        <label className="form-label" htmlFor="todo-title">Task Title <span style={{ color: 'red' }}>*</span></label>
        <input
          id="todo-title"
          type="text"
          className={`input ${error && !title.trim() ? 'input-error' : ''}`}
          placeholder="E.g., Complete project documentation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="todo-desc">Description</label>
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
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isPending}>
            <X size={16} /> Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          <Check size={16} /> {isPending ? (initialTodo ? 'Saving...' : 'Adding...') : (initialTodo ? 'Save Changes' : 'Add Task')}
        </button>
      </div>
    </form>
  );
};
