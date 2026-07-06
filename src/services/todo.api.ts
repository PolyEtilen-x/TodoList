import axiosInstance from './axiosInstance';
import type { ApiResponse, PaginatedResult, Todo, TodoQuery, TodoStats, TodoGroup, TodoList } from '../types/todo';

export const getTodos = async (query: TodoQuery) => {
  const response = await axiosInstance.get<ApiResponse<PaginatedResult<Todo>>>('/todos', { params: query });
  return response.data;
};

export const getStats = async () => {
  const response = await axiosInstance.get<ApiResponse<TodoStats>>('/todos/stats');
  return response.data;
};

export const createTodo = async (title: string, description?: string, listId?: string, isImportant?: boolean, isMyDay?: boolean) => {
  const response = await axiosInstance.post<ApiResponse<Todo>>('/todos', { title, description, listId, isImportant, isMyDay });
  return response.data;
};

export const updateTodo = async (id: string, data: Partial<Todo>) => {
  const response = await axiosInstance.patch<ApiResponse<Todo>>(`/todos/${id}`, data);
  return response.data;
};

export const deleteTodo = async (id: string) => {
  const response = await axiosInstance.delete<ApiResponse<void>>(`/todos/${id}`);
  return response.data;
};

export const globalSearch = async (query: string) => {
  const response = await axiosInstance.get<ApiResponse<unknown>>('/search', { params: { q: query } });
  return response.data;
};

// Groups
export const getTodoGroups = async () => {
  const response = await axiosInstance.get<ApiResponse<TodoGroup[]>>('/todo-groups');
  return response.data;
};

// Lists
export const getTodoLists = async () => {
  const response = await axiosInstance.get<ApiResponse<TodoList[]>>('/todo-lists');
  return response.data;
};

export const createTodoList = async (name: string, icon?: string, groupId?: string) => {
  const response = await axiosInstance.post<ApiResponse<TodoList>>('/todo-lists', { name, icon, groupId });
  return response.data;
};

export const createTodoGroup = async (name: string) => {
  const response = await axiosInstance.post<ApiResponse<TodoGroup>>('/todo-groups', { name });
  return response.data;
};

export const updateTodoList = async (id: string, name: string, icon?: string, groupId?: string) => {
  const response = await axiosInstance.patch<ApiResponse<TodoList>>(`/todo-lists/${id}`, { name, icon, groupId });
  return response.data;
};

export const updateTodoGroup = async (id: string, name: string) => {
  const response = await axiosInstance.patch<ApiResponse<TodoGroup>>(`/todo-groups/${id}`, { name });
  return response.data;
};
