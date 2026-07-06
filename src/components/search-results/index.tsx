import type { Todo, TodoGroup, TodoList } from '../../types/todo';
import { useGlobalSearchQuery } from '../../queries/todo.queries';
import { TodoItem } from '../todo-item';
import { Folder, List, AlertCircle } from 'lucide-react';
import { SkeletonList } from '../skeleton-list';
import './style.css';

interface SearchResultData {
  groups: TodoGroup[];
  lists: TodoList[];
  todos: Todo[];
}

interface SearchResultsProps {
  searchQuery: string;
  onTodoToggle: (id: string, completed: boolean) => void;
  onTodoToggleImportant: (id: string, isImportant: boolean) => void;
  onTodoDelete: (id: string) => void;
  onTodoEdit: (todo: Todo) => void;
  onSelectList: (id: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchQuery,
  onTodoToggle,
  onTodoToggleImportant,
  onTodoDelete,
  onTodoEdit,
  onSelectList
}) => {
  const { data, isLoading, isError, error } = useGlobalSearchQuery(searchQuery);

  if (isLoading) {
    return (
      <div className="search-results">
        <SkeletonList count={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card error-state">
        <AlertCircle size={32} className="state-icon" />
        <h3>Lỗi tìm kiếm</h3>
        <p>{(error as Error).message || 'Không thể lấy kết quả tìm kiếm.'}</p>
      </div>
    );
  }

  const results = data?.data as SearchResultData | undefined;
  const groups = results?.groups || [];
  const lists = results?.lists || [];
  const todos = results?.todos || [];

  const isEmpty = groups.length === 0 && lists.length === 0 && todos.length === 0;

  if (isEmpty) {
    return (
      <div className="search-empty-state">
        <div className="search-empty-icon">🔍</div>
        <h3>Không tìm thấy kết quả nào</h3>
        <p>Thử tìm kiếm với từ khóa khác xem sao!</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      {groups.length > 0 && (
        <section className="search-section">
          <h3 className="section-title">Nhóm & Thư mục</h3>
          <div className="search-grid">
            {groups.map((group: TodoGroup) => (
              <button key={group.id} className="search-card group-card">
                <Folder size={20} className="card-icon" />
                <span>{group.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {lists.length > 0 && (
        <section className="search-section">
          <h3 className="section-title">Danh sách</h3>
          <div className="search-grid">
            {lists.map((list: TodoList) => (
              <button
                key={list.id}
                className="search-card list-card"
                onClick={() => onSelectList(list.id)}
              >
                <List size={20} className="card-icon" />
                <span>{list.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {todos.length > 0 && (
        <section className="search-section">
          <h3 className="section-title">Công việc</h3>
          <div className="todo-list">
            {todos.map((todo: Todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onTodoToggle}
                onToggleImportant={onTodoToggleImportant}
                onDelete={onTodoDelete}
                onEdit={onTodoEdit}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
