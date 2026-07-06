import React from 'react';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { TodoForm } from '../todo-form';
import { TodoItem } from '../todo-item';
import { SkeletonList } from '../skeleton-list';
import { SearchResults } from '../search-results';
import { FilterChips } from '../filter-chips';
import type { Todo, ApiResponse, PaginatedResult } from '../../types/todo';
import type { TranslationKey } from '../../i18n/translations';

interface TodoListContainerProps {
  // State
  isSearchMode: boolean;
  search: string;
  isListLoading: boolean;
  isListError: boolean;
  listError: Error | null;
  todosData?: ApiResponse<PaginatedResult<Todo>>;
  editingTodo: Todo | null;
  isMutating: boolean;
  completedCollapsed: boolean;
  page: number;
  totalPages: number;

  status: 'all' | 'pending' | 'completed';
  setStatus: (status: 'all' | 'pending' | 'completed') => void;
  sortBy: 'createdAt' | 'updatedAt' | 'title';
  setSortBy: (sortBy: 'createdAt' | 'updatedAt' | 'title') => void;
  order: 'asc' | 'desc';
  setOrder: (order: 'asc' | 'desc') => void;

  // Actions
  handleCreateOrUpdate: (title: string, description?: string, startTime?: string, endTime?: string) => void;
  setEditingTodo: (todo: Todo | null) => void;
  refetch: () => void;
  handleToggleCompleted: (id: string, completed: boolean) => void;
  handleToggleImportant: (id: string, isImportant: boolean) => void;
  handleDelete: (id: string) => void;
  setCompletedCollapsed: (collapsed: boolean) => void;
  onSelectList: (id: string) => void;
  setPage: (updater: (prev: number) => number) => void;

  // Translation
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const TodoListContainer: React.FC<TodoListContainerProps> = ({
  isSearchMode,
  search,
  isListLoading,
  isListError,
  listError,
  todosData,
  editingTodo,
  isMutating,
  completedCollapsed,
  page,
  totalPages,
  handleCreateOrUpdate,
  setEditingTodo,
  refetch,
  handleToggleCompleted,
  handleToggleImportant,
  handleDelete,
  setCompletedCollapsed,
  onSelectList,
  setPage,
  t,
  status,
  setStatus,
  sortBy,
  setSortBy,
  order,
  setOrder
}) => {
  const items: Todo[] = todosData?.data?.items || [];
  const pendingTasks = items.filter((t) => !t.completed);
  const completedTasks = items.filter((t) => t.completed);

  return (
    <div className="list-section">
      {isSearchMode ? (
        <SearchResults
          searchQuery={search}
          onTodoToggle={handleToggleCompleted}
          onTodoToggleImportant={handleToggleImportant}
          onTodoDelete={handleDelete}
          onTodoEdit={setEditingTodo}
          onSelectList={onSelectList}
        />
      ) : (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <TodoForm
              initialTodo={editingTodo}
              onSubmit={handleCreateOrUpdate}
              onCancel={editingTodo ? () => setEditingTodo(null) : undefined}
              isPending={isMutating}
            />
          </div>

          {/* Filter & Sort Controls Bar */}
          <div className="list-controls-bar">
            <FilterChips value={status} onChange={setStatus} />
            <div className="sort-controls">
              <select
                className="input sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'updatedAt' | 'title')}
              >
                <option value="createdAt">{t('sortByCreated')}</option>
                <option value="updatedAt">{t('sortByUpdated')}</option>
                <option value="title">{t('sortByTitle')}</option>
              </select>
              <button
                type="button"
                className="btn btn-secondary btn-icon-only sort-order-btn"
                onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                title={t('toggleSortOrder')}
              >
                {order === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {isListLoading ? (
            <SkeletonList count={3} />
          ) : isListError ? (
            <div className="card error-state">
              <AlertCircle size={32} className="state-icon" />
              <h3>{t('failedLoadTasks')}</h3>
              <p>{listError?.message || t('systemError')}</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => refetch()}
                style={{ marginTop: '1rem' }}
              >
                {t('tryAgain')}
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="card empty-state">
              <h3>{t('noTasks')}</h3>
              <p>{t('getStarted')}</p>
            </div>
          ) : (
            <div className="tasks-lists-wrapper">
              <div className="task-group">
                {pendingTasks.length > 0 && (
                  <h4 className="group-title">{t('pendingTasksGroup')} ({pendingTasks.length})</h4>
                )}
                <div className="tasks-list">
                  {pendingTasks.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggleCompleted}
                      onToggleImportant={handleToggleImportant}
                      onEdit={setEditingTodo}
                      onDelete={handleDelete}
                      disabled={isMutating}
                    />
                  ))}
                </div>
              </div>

              <div className="task-group completed-group">
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

                {!completedCollapsed && (
                  <div className="tasks-list">
                    {completedTasks.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggleCompleted}
                        onToggleImportant={handleToggleImportant}
                        onEdit={setEditingTodo}
                        onDelete={handleDelete}
                        disabled={isMutating}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                {t('previous')}
              </button>
              <span className="page-info">
                {page} / {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                {t('next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
