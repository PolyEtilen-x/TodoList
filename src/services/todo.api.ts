import axiosInstance from './axiosInstance';
import { ApiResponse, PaginatedResult, Todo, TodoQuery, TodoStats } from '../types/todo';

export const getTodos = async (query: TodoQuery): Promise<ApiResponse<PaginatedResult<Todo>>> => {
  const response = await axiosInstance.get<ApiResponse<PaginatedResult<Todo>>>('/todos', { params: query });
  return response.data;
};

export const getStats = async (): Promise<ApiResponse<TodoStats>> => {
  const response = await axiosInstance.get<ApiResponse<TodoStats>>('/todos/stats');
  return response.data;
};

export const createTodo = async (title: string, description?: string): Promise<ApiResponse<Todo>> => {
  const response = await axiosInstance.post<ApiResponse<Todo>>('/todos', { title, description });
  return response.data;
};

export const updateTodo = async (id: string, data: Partial<Todo>): Promise<ApiResponse<Todo>> => {
  const response = await axiosInstance.patch<ApiResponse<Todo>>(`/todos/${id}`, data);
  return response.data;
};

export const deleteTodo = async (id: string): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete<ApiResponse<void>>(`/todos/${id}`);
  return response.data;
};
