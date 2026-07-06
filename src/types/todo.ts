export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  isImportant: boolean;
  isMyDay: boolean;
  listId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoGroup {
  id: string;
  name: string;
  lists?: TodoList[];
  createdAt: string;
  updatedAt: string;
}

export interface TodoList {
  id: string;
  name: string;
  icon?: string;
  isSystem: boolean;
  groupId?: string;
  group?: TodoGroup;
  _count?: {
    todos: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TodoQuery {
  search?: string;
  status?: 'all' | 'pending' | 'completed';
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  listId?: string;
  isImportant?: 'true' | 'false';
  isMyDay?: 'true' | 'false';
}

export interface TodoStats {
  total: number;
  pending: number;
  completed: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
