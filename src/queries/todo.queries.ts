import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTodo, deleteTodo, getStats, getTodos, updateTodo, globalSearch } from '../services/todo.api';
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
    mutationFn: ({ title, description }: { title: string; description?: string }) =>
      createTodo(title, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos', 'stats'] });
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
