import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTodo, deleteTodo, getStats, getTodos, updateTodo, globalSearch, getTodoGroups, getTodoLists, createTodoList, createTodoGroup, updateTodoList, updateTodoGroup, deleteTodoList } from '../services/todo.api';
import type { Todo, TodoQuery } from '../types/todo';

export const useTodosQuery = (query: TodoQuery) => {
  return useQuery({
    queryKey: ['todos', query],
    queryFn: () => getTodos(query),
  });
};

export const useStatsQuery = () => {
  return useQuery({
    queryKey: ['todos', 'stats'],
    queryFn: getStats,
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; listId?: string; isImportant?: boolean; isMyDay?: boolean }) =>
      createTodo(data.title, data.description, data.listId, data.isImportant, data.isMyDay),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['todo-lists'] }); // in case count updates
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Todo> }) =>
      updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos', 'stats'] });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos', 'stats'] });
    },
  });
};

export const useGlobalSearchQuery = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => globalSearch(query),
    enabled: query.length > 0, // only fetch if there is a query
  });
};

export const useTodoGroupsQuery = () => {
  return useQuery({
    queryKey: ['todo-groups'],
    queryFn: getTodoGroups,
  });
};

export const useTodoListsQuery = () => {
  return useQuery({
    queryKey: ['todo-lists'],
    queryFn: getTodoLists,
  });
};

export const useCreateTodoList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; icon?: string; groupId?: string }) =>
      createTodoList(data.name, data.icon, data.groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo-lists'] });
    },
  });
};

export const useCreateTodoGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      createTodoGroup(data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo-groups'] });
    },
  });
};

export const useUpdateTodoList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; name: string; icon?: string; groupId?: string }) =>
      updateTodoList(data.id, data.name, data.icon, data.groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo-lists'] });
      queryClient.invalidateQueries({ queryKey: ['todo-groups'] });
    },
  });
};

export const useUpdateTodoGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; name: string }) =>
      updateTodoGroup(data.id, data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo-groups'] });
    },
  });
};

export const useDeleteTodoList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTodoList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo-lists'] });
      queryClient.invalidateQueries({ queryKey: ['todo-groups'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos', 'stats'] });
    },
  });
};
