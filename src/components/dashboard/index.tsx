import React from 'react';
import { useAppController } from '../../hooks/useAppController';
import { Sidebar } from '../sidebar';
import { StatsSummary } from '../stats-summary';
import { AppHeader } from '../app-header';
import { TodoListContainer } from '../todo-list-container';
import { Menu } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { state, actions, data } = useAppController();

  return (
    <div className="app-layout">
      {/* Settings Sidebar */}
      <Sidebar
        isOpen={state.sidebarOpen}
        onClose={() => actions.setSidebarOpen(false)}
        search={state.search}
        onSearch={actions.onSearch}
        activeListId={state.activeListId}
        onSelectList={actions.onSelectList}
      />

      <main className="main-content">
        <div className="app-container">
          {/* Mobile Settings Trigger (Hamburger Menu) */}
          <button
            type="button"
            className="btn btn-secondary btn-icon-only settings-trigger"
            onClick={() => actions.setSidebarOpen(true)}
            title={state.t('sidebarTitle')}
            aria-label={state.t('sidebarTitle')}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}
          >
            <Menu size={18} />
          </button>

          {/* Dashboard Title Header */}
          <AppHeader
            isSearchMode={state.isSearchMode}
            search={state.search}
            selectedList={state.selectedList}
            pendingCount={state.selectedList?._count?.todos || 0}
            language={state.language}
            t={state.t}
          />

          {/* Stats Board */}
          {!state.isSearchMode && (
            <StatsSummary stats={data.statsData?.data} isLoading={data.isStatsLoading} />
          )}

          {/* List Container */}
          <TodoListContainer
            isSearchMode={state.isSearchMode}
            search={state.search}
            isListLoading={data.isListLoading}
            isListError={data.isListError}
            listError={data.listError}
            todosData={data.todosData}
            editingTodo={state.editingTodo}
            isMutating={data.isMutating}
            completedCollapsed={state.completedCollapsed}
            page={state.page}
            totalPages={data.todosData?.data?.totalPages || 1}
            handleCreateOrUpdate={actions.handleCreateOrUpdate}
            setEditingTodo={actions.setEditingTodo}
            refetch={actions.refetch}
            handleToggleCompleted={actions.handleToggleCompleted}
            handleToggleImportant={actions.handleToggleImportant}
            handleDelete={actions.handleDelete}
            setCompletedCollapsed={actions.setCompletedCollapsed}
            onSelectList={actions.onSelectList}
            setPage={actions.setPage}
            t={state.t}
            language={state.language}
          />
        </div>
      </main>
    </div>
  );
};
