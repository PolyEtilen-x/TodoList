import React from 'react';
import { Sun as SunIcon, Star, Home, List, Folder } from 'lucide-react';
import type { TodoList, TodoGroup } from '../../types/todo';

interface SidebarNavProps {
  systemLists: TodoList[];
  customLists: TodoList[];
  groups: TodoGroup[];
  activeListId: string;
  onSelectList: (id: string) => void;
  isDesktop: boolean;
  onClose: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  systemLists,
  customLists,
  groups,
  activeListId,
  onSelectList,
  isDesktop,
  onClose
}) => {
  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Sun': return <SunIcon size={18} className="nav-icon" style={{ color: 'var(--warning)' }} />;
      case 'Star': return <Star size={18} className="nav-icon" style={{ color: 'var(--danger)' }} />;
      case 'Home': return <Home size={18} className="nav-icon" style={{ color: 'var(--primary)' }} />;
      default: return <List size={18} className="nav-icon" />;
    }
  };

  const handleSelect = (id: string) => {
    onSelectList(id);
    if (!isDesktop) onClose();
  };

  return (
    <div className="sidebar-nav scrollable">
      {/* SYSTEM LISTS */}
      <div className="nav-group">
        {systemLists.map(list => (
          <button
            key={list.id}
            className={`nav-item ${activeListId === list.id ? 'active' : ''}`}
            onClick={() => handleSelect(list.id)}
          >
            {renderIcon(list.icon)}
            <span className="nav-label">{list.name}</span>
            {list._count?.todos ? <span className="nav-badge">{list._count.todos}</span> : null}
          </button>
        ))}
      </div>

      <div className="nav-divider" />

      {/* GROUPS & CUSTOM LISTS */}
      <div className="nav-group">
        {groups.map(group => (
          <div key={group.id} className="nav-group-container">
            <button className="nav-item">
              <Folder size={18} className="nav-icon" />
              <span className="nav-label">{group.name}</span>
            </button>
          </div>
        ))}

        {customLists.map(list => (
          <button
            key={list.id}
            className={`nav-item ${activeListId === list.id ? 'active' : ''}`}
            onClick={() => handleSelect(list.id)}
          >
            <List size={18} className="nav-icon" />
            <span className="nav-label">{list.name}</span>
            {list._count?.todos ? <span className="nav-badge">{list._count.todos}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
};
