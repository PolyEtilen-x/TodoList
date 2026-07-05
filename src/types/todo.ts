export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
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
