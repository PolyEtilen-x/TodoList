import { useState } from 'react';
import { 
  useTodosQuery, 
  useStatsQuery, 
  useCreateTodo, 
  useUpdateTodo, 
  useDeleteTodo 
} from './queries/todo.queries';
import type { Todo } from './types/todo';
import { StatsSummary } from './components/stats-summary';

import { FilterChips } from './components/filter-chips';
import { TodoForm } from './components/todo-form';
import { TodoItem } from './components/todo-item';
import { SkeletonList } from './components/skeleton-list';
import { Sidebar } from './components/sidebar';
import { useApp } from './context/AppContext';
import { 
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown, 
  CheckCircle, 
  AlertCircle,
  Menu
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

function App() {
  const { t, language } = useApp();

  // Query Filters & Pagination State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'title'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 5;

  // UI state
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [completedCollapsed, setCompletedCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // TanStack Queries & Mutations
  const { data: todosData, isLoading: isListLoading, isError: isListError, error: listError, refetch } = useTodosQuery({
    search,
    status,
    sortBy,
    order,
    page,
    limit,
  });

  const { data: statsData, isLoading: isStatsLoading } = useStatsQuery();

  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();

  // Toast Helpers
  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Handlers
  const handleCreateOrUpdate = async (title: string, description?: string) => {
    if (editingTodo) {
      await updateMutation.mutateAsync(
        { id: editingTodo.id, data: { title, description } },
        {
          onSuccess: () => {
            addToast(t('toastUpdateSuccess'), 'success');
            setEditingTodo(null);
          },
          onError: (err: Error) => {
            addToast(err.message || (language === 'vi' ? 'Cập nhật thất bại' : 'Failed to update task'), 'error');
          },
        }
      );
    } else {
      await createMutation.mutateAsync(
        { title, description },
        {
          onSuccess: () => {
            addToast(t('toastCreateSuccess'), 'success');
            setPage(1);
          },
          onError: (err: Error) => {
            addToast(err.message || (language === 'vi' ? 'Tạo thất bại' : 'Failed to create task'), 'error');
          },
        }
      );
    }
  };

  const handleToggleCompleted = async (id: string, completed: boolean) => {
    await updateMutation.mutateAsync(
      { id, data: { completed } },
      {
        onSuccess: () => {
          addToast(
            completed ? t('toastToggleCompleted') : t('toastTogglePending'),
            'success'
          );
        },
        onError: (err: Error) => {
          addToast(err.message || (language === 'vi' ? 'Cập nhật thất bại' : 'Failed to toggle status'), 'error');
        },
      }
    );
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('deleteConfirm'))) {
      await deleteMutation.mutateAsync(id, {
        onSuccess: () => {
          addToast(t('toastDeleteSuccess'), 'success');
          if (todosData?.data?.items.length === 1 && page > 1) {
            setPage((p) => p - 1);
          }
        },
        onError: (err: Error) => {
          addToast(err.message || (language === 'vi' ? 'Xóa thất bại' : 'Failed to delete task'), 'error');
        },
      });
    }
  };

  // Grouping for the collapsible section when filter is 'all'
  const items = todosData?.data?.items || [];
  const pendingTasks = items.filter((t) => !t.completed);
  const completedTasks = items.filter((t) => t.completed);

  const totalPages = todosData?.data?.totalPages || 1;

  return (
    <div className="app-layout">
      {/* Settings Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        totalTasks={statsData?.data?.total || 0}
      />

      <main className="main-content">
        <div className="app-container">
          {/* Mobile Settings Trigger (Hamburger Menu) */}
          <button
            type="button"
            className="btn btn-secondary btn-icon-only settings-trigger"
            onClick={() => setSidebarOpen(true)}
            title={t('sidebarTitle')}
            aria-label={t('sidebarTitle')}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}
          >
            <Menu size={18} />
          </button>

          {/* Toast Notification Container */}
          <div className="toast-container">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}
              >
                {toast.type === 'success' ? (
                  <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                ) : (
                  <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
                )}
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast.message}</span>
              </div>
            ))}
          </div>

          {/* Dashboard Title Header */}
          <header className="app-header">
            <h1 className="app-title">{t('appTitle')}</h1>
            <p className="app-subtitle">{t('appSubtitle')}</p>
          </header>

      {/* Stats Board */}
      <StatsSummary stats={statsData?.data} isLoading={isStatsLoading} />

      {/* Form Section */}
      <div style={{ marginBottom: '2rem' }}>
        <TodoForm
          initialTodo={editingTodo}
          onSubmit={handleCreateOrUpdate}
          onCancel={editingTodo ? () => setEditingTodo(null) : undefined}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      </div>

      {/* Filter and Control Bar */}
      <div className="control-bar card">
        <div className="filter-sort-row">
          <FilterChips value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
          
          <div className="sort-controls">
            <div className="select-wrapper">
              <ArrowUpDown size={14} className="select-icon" />
              <select
                className="select-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'updatedAt' | 'title')}
                aria-label="Sort by field"
              >
                <option value="createdAt">{t('createdTime')}</option>
                <option value="updatedAt">{t('updatedTime')}</option>
                <option value="title">{t('titleAlphabetical')}</option>
              </select>
            </div>

            <div className="select-wrapper">
              <select
                className="select-input"
                value={order}
                onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
                aria-label="Sort direction"
              >
                <option value="desc">{t('descending')}</option>
                <option value="asc">{t('ascending')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="list-section">
        {isListLoading ? (
          <SkeletonList count={3} />
        ) : isListError ? (
          <div className="card error-state">
            <AlertCircle size={32} className="state-icon" />
            <h3>{language === 'vi' ? 'Không thể tải danh sách công việc' : 'Failed to load tasks'}</h3>
            <p>{listError?.message || (language === 'vi' ? 'Đã xảy ra lỗi hệ thống.' : 'Something went wrong.')}</p>
            <button 
              type="button"
              className="btn btn-secondary" 
              onClick={() => refetch()} 
              style={{ marginTop: '1rem' }}
            >
              {language === 'vi' ? 'Thử lại' : 'Try Again'}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="card empty-state">
            <h3>{t('noTasks')}</h3>
            <p>{t('getStarted')}</p>
          </div>
        ) : (
          <div className="tasks-lists-wrapper">
            {/* If status filter is 'all' or 'pending', show pending group */}
            {status !== 'completed' && (
              <div className="task-group">
                {status === 'all' && pendingTasks.length > 0 && (
                  <h4 className="group-title">{t('pendingTasksGroup')} ({pendingTasks.length})</h4>
                )}
                <div className="tasks-list">
                  {(status === 'all' ? pendingTasks : items).map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggleCompleted}
                      onEdit={setEditingTodo}
                      onDelete={handleDelete}
                    />
                  ))}
                  {status === 'all' && pendingTasks.length === 0 && completedTasks.length > 0 && (
                    <div className="empty-group-text">{t('noPending')}</div>
                  )}
                </div>
              </div>
            )}

            {/* If status filter is 'all' or 'completed', show completed group */}
            {status !== 'pending' && (
              <div className="task-group completed-group">
                {status === 'all' && (
                  <button
                    type="button"
                    className="group-collapse-header"
                    onClick={() => setCompletedCollapsed(!completedCollapsed)}
                  >
                    <span className="group-title-text">
                      {t('completedTasksGroup')} ({completedTasks.length})
                    </span>
                    {completedCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                )}

                {(!completedCollapsed || status === 'completed') && (
                  <div className="tasks-list">
                    {(status === 'all' ? completedTasks : items).map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggleCompleted}
                        onEdit={setEditingTodo}
                        onDelete={handleDelete}
                      />
                    ))}
                    {status === 'all' && completedTasks.length === 0 && pendingTasks.length > 0 && (
                      <div className="empty-group-text">{t('noCompleted')}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-bar">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            {t('previous')}
          </button>
          <span className="page-indicator">
            {t('pageOf', { page, totalPages })}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            {t('next')}
          </button>
        </div>
      )}
    </div>
      </main>
    </div>
  );
}

export default App;
