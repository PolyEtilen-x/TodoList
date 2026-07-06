import React from 'react';
import { Plus, Languages, Moon, Sun, FolderPlus } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useCreateTodoList, useCreateTodoGroup } from '../../../queries/todo.queries';
import { useToast } from '../../../context/ToastContext';
import './style.css';

interface SidebarFooterProps {
  setEditingListId: (id: string | null) => void;
  setEditingGroupId: (id: string | null) => void;
  customListsCount: number;
  groupsCount: number;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  setEditingListId,
  setEditingGroupId,
  customListsCount,
  groupsCount,
}) => {
  const { language, setLanguage, theme, setTheme, t } = useApp();
  const createListMutation = useCreateTodoList();
  const createGroupMutation = useCreateTodoGroup();
  const { addToast } = useToast();

  const handleCreateList = async () => {
    const defaultName = language === 'vi'
      ? `Danh sách chưa đặt tên (${customListsCount + 1})`
      : `Untitled list (${customListsCount + 1})`;

    try {
      const res = await createListMutation.mutateAsync({ name: defaultName });
      if (res?.success && res.data?.id) {
        setEditingListId(res.data.id);
      }
    } catch (err: any) {
      addToast(
        err.message || (language === 'vi' ? 'Không thể tạo danh sách' : 'Failed to create list'),
        'error'
      );
    }
  };

  const handleCreateGroup = async () => {
    const defaultName = language === 'vi'
      ? `Nhóm chưa đặt tên (${groupsCount + 1})`
      : `Untitled group (${groupsCount + 1})`;

    try {
      const res = await createGroupMutation.mutateAsync({ name: defaultName });
      if (res?.success && res.data?.id) {
        setEditingGroupId(res.data.id);
      }
    } catch (err: any) {
      addToast(
        err.message || (language === 'vi' ? 'Không thể tạo nhóm' : 'Failed to create group'),
        'error'
      );
    }
  };

  return (
    <div className="sidebar-footer">
      {/* Row 1: Actions */}
      <div className="footer-row-actions">
        <div className="action-wrapper">
          <button
            type="button"
            className="btn-new-list"
            onClick={handleCreateList}
            disabled={createListMutation.isPending}
          >
            <Plus size={18} />
            <span>{language === 'vi' ? 'Danh sách mới' : 'New list'}</span>
          </button>
        </div>

        <div className="action-wrapper">
          <button
            type="button"
            className="btn-new-group-full"
            onClick={handleCreateGroup}
            disabled={createGroupMutation.isPending}
          >
            <FolderPlus size={18} />
          </button>
        </div>
      </div>

      {/* Row 2: Settings */}
      <div className="footer-row-settings">
        <button
          type="button"
          className="mini-setting-btn"
          onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
          title={t('language')}
        >
          <Languages size={16} />
          <span>{language.toUpperCase()}</span>
        </button>
        <button
          type="button"
          className="mini-setting-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={t('theme')}
        >
          {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          <span>{theme === 'dark' ? (language === 'vi' ? 'Tối' : 'Dark') : (language === 'vi' ? 'Sáng' : 'Light')}</span>
        </button>
      </div>
    </div>
  );
};
