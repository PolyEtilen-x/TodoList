import { useState } from 'react';
import {
  useTodosQuery,
  useStatsQuery,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useTodoListsQuery
} from '../queries/todo.queries';
import { useToast } from '../context/ToastContext';
import { useApp } from '../context/AppContext';
import type { Todo, TodoQuery } from '../types/todo';

export const useAppController = () => {
  const { t, language } = useApp();
  const { addToast } = useToast();

  // 1. App States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [activeListId, setActiveListId] = useState<string>('');
  
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [completedCollapsed, setCompletedCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 2. Fetch Lists to map Smart Lists
  const { data: listsData } = useTodoListsQuery();
  const selectedList = listsData?.data?.find(l => l.id === activeListId);
  const isSearchMode = search.trim().length > 0;

  // 3. Build Filters dynamically
  const queryFilters: TodoQuery = { page, limit };
  
  if (!isSearchMode && selectedList) {
    if (selectedList.name === 'Important') {
      queryFilters.isImportant = 'true';
    } else if (selectedList.name === 'My Day') {
      queryFilters.isMyDay = 'true';
    } else {
      queryFilters.listId = activeListId;
    }
  } else if (isSearchMode) {
    queryFilters.search = search;
  }

  // 4. Data Fetching
  const { 
    data: todosData, 
    isLoading: isListLoading, 
    isError: isListError, 
    error: listError, 
    refetch 
  } = useTodosQuery(queryFilters);

  const { data: statsData, isLoading: isStatsLoading } = useStatsQuery();

  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();

  // 5. Action Handlers
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
      let listId: string | undefined = undefined;
      let isImportant = false;
      let isMyDay = false;
      
      if (selectedList && !isSearchMode) {
        if (selectedList.name === 'Important') isImportant = true;
        else if (selectedList.name === 'My Day') isMyDay = true;
        else if (!selectedList.isSystem) listId = selectedList.id;
      }

      await createMutation.mutateAsync(
        { title, description, listId, isImportant, isMyDay },
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
        onError: (err: Error) => {
          addToast(err.message || (language === 'vi' ? 'Cập nhật thất bại' : 'Failed to update task'), 'error');
        },
      }
    );
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('deleteConfirm'))) {
      await deleteMutation.mutateAsync(id, {
        onSuccess: () => {
          addToast(t('toastDeleteSuccess'), 'success');
          if (editingTodo?.id === id) {
            setEditingTodo(null);
          }
        },
        onError: (err: Error) => {
          addToast(err.message || (language === 'vi' ? 'Xóa thất bại' : 'Failed to delete task'), 'error');
        },
      });
    }
  };

  const onSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const onSelectList = (id: string) => {
    setActiveListId(id);
    setPage(1);
    setSearch('');
  };

  // 6. Return Data Package
  return {
    state: {
      search,
      page,
      limit,
      activeListId,
      editingTodo,
      completedCollapsed,
      sidebarOpen,
      isSearchMode,
      selectedList,
      language,
      t
    },
    actions: {
      setSearch,
      setPage,
      setActiveListId,
      setEditingTodo,
      setCompletedCollapsed,
      setSidebarOpen,
      handleCreateOrUpdate,
      handleToggleCompleted,
      handleDelete,
      onSearch,
      onSelectList,
      refetch
    },
    data: {
      todosData,
      isListLoading,
      isListError,
      listError,
      statsData,
      isStatsLoading,
      isMutating: createMutation.isPending || updateMutation.isPending
    }
  };
};
