import React, { useState, useEffect, useCallback } from 'react';
import { Sun as SunIcon, Star, Home, List, Folder, ChevronDown, ChevronRight, Plus, Edit2, Trash2, FolderOpen } from 'lucide-react';
import type { TodoList, TodoGroup } from '../../../types/todo';
import { useUpdateTodoList, useUpdateTodoGroup, useCreateTodoList, useDeleteTodoList, useDeleteTodoGroup } from '../../../queries/todo.queries';
import './style.css';

interface SidebarNavProps {
  systemLists: TodoList[];
  customLists: TodoList[];
  groups: TodoGroup[];
  activeListId: string;
  onSelectList: (id: string) => void;
  isDesktop: boolean;
  onClose: () => void;
  editingListId: string | null;
  setEditingListId: (id: string | null) => void;
  editingGroupId: string | null;
  setEditingGroupId: (id: string | null) => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  listId: string;
  listName: string;
  listGroupId?: string;
  listIcon?: string;
}

interface GroupContextMenuState {
  x: number;
  y: number;
  groupId: string;
  groupName: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  systemLists,
  customLists,
  groups,
  activeListId,
  onSelectList,
  isDesktop,
  onClose,
  editingListId,
  setEditingListId,
  editingGroupId,
  setEditingGroupId,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [groupContextMenu, setGroupContextMenu] = useState<GroupContextMenuState | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: 'list' | 'group';
    id: string;
    name: string;
  } | null>(null);

  const updateListMutation = useUpdateTodoList();
  const updateGroupMutation = useUpdateTodoGroup();
  const createListMutation = useCreateTodoList();
  const deleteListMutation = useDeleteTodoList();
  const deleteGroupMutation = useDeleteTodoGroup();

  // Đóng context menu khi click ra ngoài
  useEffect(() => {
    const handleCloseMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.context-menu')) {
        return;
      }
      setContextMenu(null);
      setGroupContextMenu(null);
    };
    if (contextMenu || groupContextMenu) {
      document.addEventListener('mousedown', handleCloseMenu);
    }
    return () => document.removeEventListener('mousedown', handleCloseMenu);
  }, [contextMenu, groupContextMenu]);

  const handleDeleteListAction = useCallback((listId: string) => {
    setContextMenu(null);
    const list = customLists.find(l => l.id === listId);
    if (list) {
      setConfirmModal({ type: 'list', id: list.id, name: list.name });
    }
  }, [customLists]);

  // Phím tắt bàn phím F2 (đổi tên) và Delete (xóa) khi đang chọn list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      if (activeListId) {
        const activeList = customLists.find(l => l.id === activeListId);
        if (!activeList) return;

        if (e.key === 'F2') {
          e.preventDefault();
          setEditingListId(activeListId);
        } else if (e.key === 'Delete') {
          e.preventDefault();
          handleDeleteListAction(activeListId);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeListId, customLists, handleDeleteListAction, setEditingListId]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleCreateListInGroup = async (groupId: string) => {
    // Tự động mở rộng nhóm
    setExpandedGroups(prev => ({ ...prev, [groupId]: true }));

    const defaultName = navigator.language.startsWith('vi')
      ? `Danh sách chưa đặt tên (${customLists.length + 1})`
      : `Untitled list (${customLists.length + 1})`;

    try {
      const res = await createListMutation.mutateAsync({ name: defaultName, groupId });
      if (res?.success && res.data?.id) {
        setEditingListId(res.data.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameGroup = async (id: string, name: string) => {
    setEditingGroupId(null);
    if (!name.trim()) return;
    try {
      await updateGroupMutation.mutateAsync({ id, name: name.trim() });
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDownGroup = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameGroup(id, e.currentTarget.value);
    } else if (e.key === 'Escape') {
      setEditingGroupId(null);
    }
  };

  const handleRenameList = async (id: string, name: string) => {
    setEditingListId(null);
    if (!name.trim()) return;
    try {
      await updateListMutation.mutateAsync({ id, name: name.trim() });
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDownList = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameList(id, e.currentTarget.value);
    } else if (e.key === 'Escape') {
      setEditingListId(null);
    }
  };

  // --- DRAG & DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, listId: string) => {
    e.dataTransfer.setData('text/plain', listId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    setDragOverGroupId(groupId);
  };

  const handleDragLeave = () => {
    setDragOverGroupId(null);
  };

  const handleDropOnGroup = async (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverGroupId(null);

    const listId = e.dataTransfer.getData('text/plain');
    if (!listId) return;

    const list = customLists.find(l => l.id === listId);
    if (!list) return;

    try {
      await updateListMutation.mutateAsync({
        id: listId,
        name: list.name,
        icon: list.icon,
        groupId: groupId,
      });
      // Tự động mở rộng nhóm sau khi thả
      setExpandedGroups(prev => ({ ...prev, [groupId]: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDropOutside = async (e: React.DragEvent) => {
    e.preventDefault();
    const listId = e.dataTransfer.getData('text/plain');
    if (!listId) return;

    const list = customLists.find(l => l.id === listId);
    if (!list || !list.groupId) return; // Đã nằm ngoài rồi thì thôi

    try {
      await updateListMutation.mutateAsync({
        id: listId,
        name: list.name,
        icon: list.icon,
        groupId: null, // chuyển thành ungrouped
      });
    } catch (err) {
      console.error(err);
    }
  };

  // --- CONTEXT MENU HANDLERS ---
  const handleContextMenu = (e: React.MouseEvent, list: TodoList) => {
    e.preventDefault();
    e.stopPropagation();
    setGroupContextMenu(null); // Đóng menu nhóm
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      listId: list.id,
      listName: list.name,
      listGroupId: list.groupId,
      listIcon: list.icon
    });
  };

  const handleGroupContextMenu = (e: React.MouseEvent, group: TodoGroup) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null); // Đóng menu danh sách
    setGroupContextMenu({
      x: e.clientX,
      y: e.clientY,
      groupId: group.id,
      groupName: group.name,
    });
  };

  const handleRenameGroupAction = (groupId: string) => {
    setGroupContextMenu(null);
    setEditingGroupId(groupId);
  };

  const handleDeleteGroupAction = (groupId: string) => {
    setGroupContextMenu(null);
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setConfirmModal({ type: 'group', id: group.id, name: group.name });
    }
  };

  const handleRenameAction = (listId: string) => {
    setContextMenu(null);
    setEditingListId(listId);
  };

  const handleMoveListToGroup = async (listId: string, name: string, icon?: string, groupId?: string | null) => {
    setContextMenu(null);
    try {
      await updateListMutation.mutateAsync({ id: listId, name, icon, groupId });
      if (groupId) {
        setExpandedGroups(prev => ({ ...prev, [groupId]: true }));
      }
    } catch (err) {
      console.error(err);
    }
  };


  const handleConfirmDelete = async () => {
    if (!confirmModal) return;
    const { type, id } = confirmModal;
    setConfirmModal(null);

    try {
      if (type === 'list') {
        await deleteListMutation.mutateAsync(id);
        if (activeListId === id) {
          const defaultList = systemLists.find(l => l.name === 'Important') || systemLists[0];
          if (defaultList) {
            onSelectList(defaultList.id);
          }
        }
      } else if (type === 'group') {
        await deleteGroupMutation.mutateAsync(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  const ungroupedLists = customLists.filter(list => !list.groupId);

  return (
    <div className="sidebar-nav">
      {/* SYSTEM LISTS - FIXED AT TOP */}
      <div className="system-lists-container">
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

      {/* GROUPS & CUSTOM LISTS - SCROLLABLE AREA */}
      <div 
        className="sidebar-nav-scrollable"
        onDragOver={handleDragOver}
        onDrop={handleDropOutside}
      >
        <div className="nav-group">
          {groups.map(group => {
            const isExpanded = !!expandedGroups[group.id];
            const isEditing = editingGroupId === group.id;
            const groupLists = group.lists || [];
            const isDragOver = dragOverGroupId === group.id;

            return (
              <div 
                key={group.id} 
                className="nav-group-container"
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, group.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropOnGroup(e, group.id)}
              >
                {isEditing ? (
                  <div className="btn-group-toggle editing" onClick={(e) => e.stopPropagation()}>
                    <Folder size={18} className="nav-icon" />
                    <input
                      type="text"
                      className="nav-label-input"
                      defaultValue={group.name}
                      onBlur={(e) => handleRenameGroup(group.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDownGroup(e, group.id)}
                      autoFocus
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ChevronRight size={16} className="group-chevron" style={{ opacity: 0.3 }} />
                  </div>
                ) : (
                  <div className="btn-group-toggle-wrapper">
                    <button 
                      type="button"
                      className={`btn-group-toggle ${isDragOver ? 'drag-over' : ''}`}
                      onClick={() => toggleGroup(group.id)}
                      onContextMenu={(e) => handleGroupContextMenu(e, group)}
                    >
                      <Folder size={18} className="nav-icon" />
                      <span className="nav-label">{group.name}</span>
                      <div className="group-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="btn-group-action"
                          onClick={() => handleCreateListInGroup(group.id)}
                          disabled={createListMutation.isPending}
                          title={navigator.language.startsWith('vi') ? 'Thêm danh sách' : 'Add list'}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      {isExpanded ? (
                        <ChevronDown size={16} className="group-chevron" />
                      ) : (
                        <ChevronRight size={16} className="group-chevron" />
                      )}
                    </button>
                  </div>
                )}

                {isExpanded && (
                  <div className="group-lists-container">
                    {groupLists.length === 0 ? (
                      <div className="group-empty-tip">
                        {navigator.language.startsWith('vi') ? 'Kéo danh sách vào đây' : 'Drag here to add lists'}
                      </div>
                    ) : (
                      groupLists.map(list => {
                        const isListEditing = editingListId === list.id;

                        return isListEditing ? (
                          <div
                            key={list.id}
                            className={`nav-item nested-nav-item editing ${activeListId === list.id ? 'active' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <List size={18} className="nav-icon" />
                            <input
                              type="text"
                              className="nav-label-input"
                              defaultValue={list.name}
                              onBlur={(e) => handleRenameList(list.id, e.target.value)}
                              onKeyDown={(e) => handleKeyDownList(e, list.id)}
                              autoFocus
                              onFocus={(e) => e.target.select()}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <button
                            key={list.id}
                            className={`nav-item nested-nav-item ${activeListId === list.id ? 'active' : ''}`}
                            onClick={() => handleSelect(list.id)}
                            draggable
                            onDragStart={(e) => handleDragStart(e, list.id)}
                            onContextMenu={(e) => handleContextMenu(e, list)}
                          >
                            <List size={18} className="nav-icon" />
                            <span className="nav-label">{list.name}</span>
                            {list._count?.todos ? <span className="nav-badge">{list._count.todos}</span> : null}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {ungroupedLists.map(list => {
            const isListEditing = editingListId === list.id;

            return isListEditing ? (
              <div
                key={list.id}
                className={`nav-item editing ${activeListId === list.id ? 'active' : ''}`}
                onClick={(e) => e.stopPropagation()}
              >
                <List size={18} className="nav-icon" />
                <input
                  type="text"
                  className="nav-label-input"
                  defaultValue={list.name}
                  onBlur={(e) => handleRenameList(list.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDownList(e, list.id)}
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ) : (
              <button
                key={list.id}
                className={`nav-item ${activeListId === list.id ? 'active' : ''}`}
                onClick={() => handleSelect(list.id)}
                draggable
                onDragStart={(e) => handleDragStart(e, list.id)}
                onContextMenu={(e) => handleContextMenu(e, list)}
              >
                <List size={18} className="nav-icon" />
                <span className="nav-label">{list.name}</span>
                {list._count?.todos ? <span className="nav-badge">{list._count.todos}</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="context-menu" 
          style={{ 
            position: 'fixed', 
            top: contextMenu.y, 
            left: contextMenu.x,
            zIndex: 1000 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            type="button" 
            className="context-menu-item"
            onClick={() => handleRenameAction(contextMenu.listId)}
          >
            <Edit2 size={14} className="context-menu-icon" />
            <span>{navigator.language.startsWith('vi') ? 'Đổi tên danh sách' : 'Rename list'}</span>
            <span className="context-menu-shortcut">F2</span>
          </button>

          <div className="context-menu-submenu-trigger">
            <button type="button" className="context-menu-item">
              <FolderOpen size={14} className="context-menu-icon" />
              <span>{navigator.language.startsWith('vi') ? 'Di chuyển đến nhóm...' : 'Move list to...'}</span>
              <ChevronRight size={14} className="context-submenu-arrow" />
            </button>
            
            <div className="context-submenu">
              {contextMenu.listGroupId && (
                <button
                  type="button"
                  className="context-menu-item"
                  onClick={() => handleMoveListToGroup(contextMenu.listId, contextMenu.listName, contextMenu.listIcon, null)}
                >
                  <span>{navigator.language.startsWith('vi') ? 'Đưa ra khỏi nhóm' : 'Remove from group'}</span>
                </button>
              )}
              {groups.map(group => {
                if (group.id === contextMenu.listGroupId) return null;
                return (
                  <button
                    key={group.id}
                    type="button"
                    className="context-menu-item"
                    onClick={() => handleMoveListToGroup(contextMenu.listId, contextMenu.listName, contextMenu.listIcon, group.id)}
                  >
                    <Folder size={14} className="context-menu-icon" />
                    <span>{group.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="context-menu-divider" />

          <button 
            type="button" 
            className="context-menu-item delete"
            onClick={() => handleDeleteListAction(contextMenu.listId)}
          >
            <Trash2 size={14} className="context-menu-icon" />
            <span>{navigator.language.startsWith('vi') ? 'Xóa danh sách' : 'Delete list'}</span>
            <span className="context-menu-shortcut">Delete</span>
          </button>
        </div>
      )}

      {/* Group Context Menu */}
      {groupContextMenu && (
        <div 
          className="context-menu" 
          style={{ 
            position: 'fixed', 
            top: groupContextMenu.y, 
            left: groupContextMenu.x,
            zIndex: 1000 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            type="button" 
            className="context-menu-item"
            onClick={() => handleRenameGroupAction(groupContextMenu.groupId)}
          >
            <Edit2 size={14} className="context-menu-icon" />
            <span>{navigator.language.startsWith('vi') ? 'Đổi tên nhóm' : 'Rename group'}</span>
          </button>

          <div className="context-menu-divider" />

          <button 
            type="button" 
            className="context-menu-item delete"
            onClick={() => handleDeleteGroupAction(groupContextMenu.groupId)}
          >
            <Trash2 size={14} className="context-menu-icon" />
            <span>{navigator.language.startsWith('vi') ? 'Xóa nhóm' : 'Delete group'}</span>
          </button>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmModal && (
        <div className="modal-backdrop" onClick={() => setConfirmModal(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {confirmModal.type === 'list' 
                ? (navigator.language.startsWith('vi') ? 'Xóa danh sách' : 'Delete list') 
                : (navigator.language.startsWith('vi') ? 'Xóa nhóm' : 'Delete group')}
            </h3>
            <p className="modal-message">
              {confirmModal.type === 'list'
                ? (navigator.language.startsWith('vi') 
                    ? `Danh sách "${confirmModal.name}" sẽ bị xóa vĩnh viễn.` 
                    : `“${confirmModal.name}” will be permanently deleted.`)
                : (navigator.language.startsWith('vi')
                    ? `Nhóm "${confirmModal.name}" sẽ bị xóa. Các danh sách con sẽ được đưa ra ngoài.`
                    : `“${confirmModal.name}” will be deleted. Sub-lists will be ungrouped.`)}
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-modal-delete" onClick={handleConfirmDelete}>
                {navigator.language.startsWith('vi') ? 'Xóa' : 'Delete'}
              </button>
              <button type="button" className="btn-modal-cancel" onClick={() => setConfirmModal(null)}>
                {navigator.language.startsWith('vi') ? 'Hủy' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
