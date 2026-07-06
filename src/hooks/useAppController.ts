import { useState, useEffect } from 'react';
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
import type { Todo, TodoQuery, TodoList, ApiResponse } from '../types/todo';

// Helper hook to encapsulate all query, pagination, search, sorting and filtering state
const useTodoQueryState = (listsData: ApiResponse<TodoList[]> | undefined) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeListId, setActiveListId] = useState<string>('');
  const [status, setStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'title'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const selectedList = listsData?.data?.find((l: TodoList) => l.id === activeListId);
  const isSearchMode = search.trim().length > 0;

  // Auto-select 'Important' list by default if nothing is selected
  useEffect(() => {
    const allLists = listsData?.data || [];
    const systemLists = allLists.filter((l: TodoList) => l.isSystem);
    if (!activeListId && systemLists.length > 0) {
      const defaultList = systemLists.find((l: TodoList) => l.name === 'Important') || systemLists[0];
      if (defaultList) {
        setTimeout(() => {
          setActiveListId(defaultList.id);
        }, 0);
      }
    }
  }, [activeListId, listsData]);

  // Build Filters dynamically
  const queryFilters: TodoQuery = { page, limit: 10, status, sortBy, order };

  if (!isSearchMode && selectedList) {
    if (selectedList.name === 'Important') {
      queryFilters.isImportant = 'true';
    } else {
      queryFilters.listId = activeListId;
    }
  } else if (isSearchMode) {
    queryFilters.search = search;
  }

  return {
    search,
    setSearch,
    page,
    setPage,
    activeListId,
    setActiveListId,
    status,
    setStatus,
    sortBy,
    setSortBy,
    order,
    setOrder,
    selectedList,
    isSearchMode,
    queryFilters,
  };
};

export const useAppController = () => {
  const { t, language } = useApp();
  const { addToast } = useToast();

  // 1. App UI States
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [completedCollapsed, setCompletedCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 2. Fetch Todo Lists
  const { data: listsData } = useTodoListsQuery();

  // 3. Extract Query & Filter State
  const queryState = useTodoQueryState(listsData);

  // 4. Data Fetching
  const { 
    data: todosData, 
    isLoading: isListLoading, 
    isError: isListError, 
    error: listError, 
    refetch 
  } = useTodosQuery(queryState.queryFilters);

  const { data: statsData, isLoading: isStatsLoading } = useStatsQuery(queryState.queryFilters);

  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();

  // 5. Action Handlers
  const handleCreateOrUpdate = async (
    title: string,
    description?: string,
    startTime?: string,
    endTime?: string
  ) => {
    if (editingTodo) {
      await updateMutation.mutateAsync(
        { id: editingTodo.id, data: { title, description, startTime, endTime } },
        {
          onSuccess: () => {
            addToast(t('toastUpdateSuccess'), 'success');
            setEditingTodo(null);
          },
          onError: (err: Error) => {
            addToast(err.message || t('toastUpdateError'), 'error');
          },
        }
      );
    } else {
      let listId: string | undefined = undefined;
      let isImportant = false;
      
      if (queryState.selectedList && !queryState.isSearchMode) {
        if (queryState.selectedList.name === 'Important') isImportant = true;
        else if (!queryState.selectedList.isSystem) listId = queryState.selectedList.id;
      }

      await createMutation.mutateAsync(
        { title, description, listId, isImportant, startTime, endTime },
        {
          onSuccess: () => {
            addToast(t('toastCreateSuccess'), 'success');
            queryState.setPage(1);
          },
          onError: (err: Error) => {
            addToast(err.message || t('toastCreateError'), 'error');
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
          addToast(err.message || t('toastUpdateError'), 'error');
        },
      }
    );
  };

  const handleToggleImportant = async (id: string, isImportant: boolean) => {
    await updateMutation.mutateAsync(
      { id, data: { isImportant } },
      {
        onError: (err: Error) => {
          addToast(err.message || t('toastUpdateError'), 'error');
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
          addToast(err.message || t('toastDeleteError'), 'error');
        },
      });
    }
  };

  const onSearch = (value: string) => {
    queryState.setSearch(value);
    queryState.setPage(1);
  };

  const onSelectList = (id: string) => {
    queryState.setActiveListId(id);
    queryState.setPage(1);
    queryState.setSearch('');
  };

  // 6. Return Data Package
  return {
    state: {
      search: queryState.search,
      page: queryState.page,
      limit: 10,
      activeListId: queryState.activeListId,
      editingTodo,
      completedCollapsed,
      sidebarOpen,
      isSearchMode: queryState.isSearchMode,
      selectedList: queryState.selectedList,
      language,
      t,
      status: queryState.status,
      sortBy: queryState.sortBy,
      order: queryState.order
    },
    actions: {
      setSearch: queryState.setSearch,
      setPage: queryState.setPage,
      setActiveListId: queryState.setActiveListId,
      setEditingTodo,
      setCompletedCollapsed,
      setSidebarOpen,
      handleCreateOrUpdate,
      handleToggleCompleted,
      handleToggleImportant,
      handleDelete,
      onSearch,
      onSelectList,
      refetch,
      setStatus: queryState.setStatus,
      setSortBy: queryState.setSortBy,
      setOrder: queryState.setOrder
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
