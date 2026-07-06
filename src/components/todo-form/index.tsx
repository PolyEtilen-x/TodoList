import React, { useState, useRef, useEffect } from 'react';
import type { Todo } from '../../types/todo';
import { Check, X, Plus, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './style.css';

interface TodoFormProps {
  initialTodo?: Todo | null;
  onSubmit: (title: string, description?: string, startTime?: string, endTime?: string) => void;
  onCancel?: () => void;
  isPending: boolean;
}

const formatDateForInput = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatTimeForInput = (date: Date) => {
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${min}`;
};

export const TodoForm: React.FC<TodoFormProps> = ({ initialTodo, onSubmit, onCancel, isPending }) => {
  const { t, language } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState<boolean>(!!initialTodo);
  const [prevInitialTodoId, setPrevInitialTodoId] = useState<string | null>(initialTodo?.id || null);

  // Time States
  const [hasTime, setHasTime] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTimeVal, setStartTimeVal] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTimeVal, setEndTimeVal] = useState('');

  const titleInputRef = useRef<HTMLInputElement>(null);

  const currentInitialTodoId = initialTodo?.id || null;
  if (currentInitialTodoId !== prevInitialTodoId) {
    setTitle(initialTodo ? initialTodo.title : '');
    setDescription(initialTodo?.description || '');
    setError('');
    setIsExpanded(!!initialTodo);
    setPrevInitialTodoId(currentInitialTodoId);

    if (initialTodo?.startTime) {
      setHasTime(true);
      const start = new Date(initialTodo.startTime);
      setStartDate(formatDateForInput(start));
      setStartTimeVal(formatTimeForInput(start));
      
      if (initialTodo.endTime) {
        const end = new Date(initialTodo.endTime);
        setEndDate(formatDateForInput(end));
        setEndTimeVal(formatTimeForInput(end));
      } else {
        setEndDate('');
        setEndTimeVal('');
      }
    } else {
      setHasTime(false);
      setStartDate('');
      setStartTimeVal('');
      setEndDate('');
      setEndTimeVal('');
    }
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

    let finalStartTime: string | undefined = undefined;
    let finalEndTime: string | undefined = undefined;

    if (hasTime) {
      if (!startDate || !startTimeVal) {
        setError(language === 'vi' ? 'Vui lòng chọn đầy đủ ngày và giờ bắt đầu.' : 'Please select both start date and time.');
        return;
      }
      const startObj = new Date(`${startDate}T${startTimeVal}`);
      finalStartTime = startObj.toISOString();

      if (endDate && endTimeVal) {
        const endObj = new Date(`${endDate}T${endTimeVal}`);
        if (endObj < startObj) {
          setError(language === 'vi' ? 'Thời gian kết thúc phải sau thời gian bắt đầu.' : 'End time must be after start time.');
          return;
        }
        finalEndTime = endObj.toISOString();
      } else if (endDate || endTimeVal) {
        setError(language === 'vi' ? 'Vui lòng điền đầy đủ cả ngày và giờ kết thúc.' : 'Please select both end date and time.');
        return;
      }
    }

    try {
      await onSubmit(trimmedTitle, description.trim() || undefined, finalStartTime, finalEndTime);
      if (!initialTodo) {
        setTitle('');
        setDescription('');
        setHasTime(false);
        setStartDate('');
        setStartTimeVal('');
        setEndDate('');
        setEndTimeVal('');
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
      setHasTime(false);
      setStartDate('');
      setStartTimeVal('');
      setEndDate('');
      setEndTimeVal('');
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

      {/* Checkbox to toggle execution time selection */}
      <div className="form-group-checkbox">
        <label className="checkbox-label-flat">
          <input
            type="checkbox"
            checked={hasTime}
            onChange={(e) => {
              const checked = e.target.checked;
              setHasTime(checked);
              if (checked && !startDate) {
                const now = new Date();
                setStartDate(formatDateForInput(now));
                setStartTimeVal(formatTimeForInput(now));
                
                const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
                setEndDate(formatDateForInput(oneHourLater));
                setEndTimeVal(formatTimeForInput(oneHourLater));
              }
            }}
            disabled={isPending}
          />
          <span>{language === 'vi' ? 'Đặt thời gian thực hiện' : 'Set execution time'}</span>
        </label>
      </div>

      {/* Row aligned date and time inputs */}
      {hasTime && (
        <div className="time-picker-section">
          {/* Start Date & Time */}
          <div className="time-picker-row">
            <div className="time-row-header">
              <Clock size={16} className="clock-icon" />
              <span className="time-label">{language === 'vi' ? 'Bắt đầu' : 'Start'}</span>
            </div>
            <div className="time-inputs-container">
              <input
                type="date"
                className="input date-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isPending}
              />
              <input
                type="time"
                className="input time-input"
                value={startTimeVal}
                onChange={(e) => setStartTimeVal(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div className="time-picker-row">
            <div className="time-row-header">
              <Clock size={16} className="clock-icon" />
              <span className="time-label">{language === 'vi' ? 'Kết thúc' : 'End'}</span>
            </div>
            <div className="time-inputs-container">
              <input
                type="date"
                className="input date-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isPending}
              />
              <input
                type="time"
                className="input time-input"
                value={endTimeVal}
                onChange={(e) => setEndTimeVal(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
        </div>
      )}

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
