import React, { useEffect, useState } from 'react';
import { Plus, FolderPlus } from 'lucide-react';
import { SearchBar } from '../search-bar';
import { useTodoListsQuery, useTodoGroupsQuery, useCreateTodoList, useCreateTodoGroup } from '../../queries/todo.queries';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { SidebarProfile } from './profile';
import { SidebarNav } from './nav';
import { SidebarFooter } from './footer';
import './style.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  onSearch: (value: string) => void;
  activeListId: string;
  onSelectList: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  search,
  onSearch,
  activeListId,
  onSelectList
}) => {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 768);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const { data: listsData } = useTodoListsQuery();
  const { data: groupsData } = useTodoGroupsQuery();
  const { language } = useApp();
  const { addToast } = useToast();
  const createListMutation = useCreateTodoList();
  const createGroupMutation = useCreateTodoGroup();

  const allLists = listsData?.data || [];
  const systemLists = allLists.filter(l => l.isSystem);
  const customLists = allLists.filter(l => !l.isSystem);
  const groups = groupsData?.data || [];

  // Auto-select 'Important' list by default if nothing is selected
  useEffect(() => {
    if (!activeListId && systemLists.length > 0) {
      const defaultList = systemLists.find(l => l.name === 'Important') || systemLists[0];
      if (defaultList) {
        onSelectList(defaultList.id);
      }
    }
  }, [activeListId, systemLists, onSelectList]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 769px)');
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [mounted, setMounted] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setMounted(true);
  }

  useEffect(() => {
    if (isDesktop) {
      document.body.style.overflow = '';
      return;
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    } else {
      const timer = setTimeout(() => setMounted(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isDesktop]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDesktop) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isDesktop]);

  const handleCreateList = async () => {
    const defaultName = language === 'vi'
      ? `Danh sách chưa đặt tên (${customLists.length + 1})`
      : `Untitled list (${customLists.length + 1})`;
    try {
      const res = await createListMutation.mutateAsync({ name: defaultName });
      if (res?.success && res.data?.id) {
        setEditingListId(res.data.id);
      }
    } catch (err: any) {
      addToast(err.message || (language === 'vi' ? 'Không thể tạo danh sách' : 'Failed to create list'), 'error');
    }
  };

  const handleCreateGroup = async () => {
    const defaultName = language === 'vi'
      ? `Nhóm chưa đặt tên (${groups.length + 1})`
      : `Untitled group (${groups.length + 1})`;
    try {
      const res = await createGroupMutation.mutateAsync({ name: defaultName });
      if (res?.success && res.data?.id) {
        setEditingGroupId(res.data.id);
      }
    } catch (err: any) {
      addToast(err.message || (language === 'vi' ? 'Không thể tạo nhóm' : 'Failed to create group'), 'error');
    }
  };

  const shouldRender = isDesktop || mounted;
  if (!shouldRender) return null;

  return (
    <div
      className={`sidebar-backdrop ${isDesktop ? 'is-desktop' : ''} ${isOpen ? 'is-open' : ''}`}
      onClick={isDesktop ? undefined : onClose}
    >
      <div className="sidebar-panel" onClick={(e) => e.stopPropagation()}>
        {/* HEADER: User Profile */}
        <SidebarProfile isDesktop={isDesktop} onClose={onClose} />

        {/* SEARCH BAR */}
        <div className="sidebar-search">
          <SearchBar value={search} onSearch={onSearch} />
        </div>

        {/* MAIN NAVIGATION */}
        <SidebarNav
          systemLists={systemLists}
          customLists={customLists}
          groups={groups}
          activeListId={activeListId}
          onSelectList={onSelectList}
          isDesktop={isDesktop}
          onClose={onClose}
          editingListId={editingListId}
          setEditingListId={setEditingListId}
          editingGroupId={editingGroupId}
          setEditingGroupId={setEditingGroupId}
        />

        {/* NEW LIST / GROUP ACTIONS — nằm ngay dưới nav */}
        <div className="sidebar-actions-row">
          <button
            type="button"
            className="btn-new-list-flat"
            onClick={handleCreateList}
            disabled={createListMutation.isPending}
          >
            <Plus size={18} />
            <span>{language === 'vi' ? 'Danh sách mới' : 'New list'}</span>
          </button>
          <button
            type="button"
            className="btn-new-group-icon"
            onClick={handleCreateGroup}
            disabled={createGroupMutation.isPending}
            title={language === 'vi' ? 'Nhóm mới' : 'New group'}
          >
            <FolderPlus size={18} />
          </button>
        </div>

        {/* SETTINGS — dòng phụ cuối cùng */}
        <SidebarFooter />
      </div>
    </div>
  );
};
