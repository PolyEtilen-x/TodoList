import React, { useState, useRef } from 'react';
import { Plus, Languages, Moon, Sun, FolderPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCreateTodoList, useCreateTodoGroup } from '../../queries/todo.queries';
import { useToast } from '../../context/ToastContext';

export const SidebarFooter: React.FC = () => {
  const { language, setLanguage, theme, setTheme, t } = useApp();
  const createListMutation = useCreateTodoList();
  const createGroupMutation = useCreateTodoGroup();
  const { addToast } = useToast();

  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  const listInputRef = useRef<HTMLInputElement>(null);
  const groupInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) {
      setIsCreatingList(false);
      return;
    }

    try {
      await createListMutation.mutateAsync({ name: newListName.trim() });
      addToast(
        language === 'vi' ? 'Tạo danh sách thành công!' : 'List created successfully!',
        'success'
      );
    } catch (err: any) {
      addToast(
        err.response?.data?.message ||
        (language === 'vi' ? 'Không thể tạo danh sách' : 'Failed to create list'),
        'error'
      );
    } finally {
      setIsCreatingList(false);
      setNewListName('');
    }
  };

  const handleSubmitGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setIsCreatingGroup(false);
      return;
    }

    try {
      await createGroupMutation.mutateAsync({ name: newGroupName.trim() });
      addToast(
        language === 'vi' ? 'Tạo nhóm thành công!' : 'Group created successfully!',
        'success'
      );
    } catch (err: any) {
      addToast(
        err.response?.data?.message ||
        (language === 'vi' ? 'Không thể tạo nhóm' : 'Failed to create group'),
        'error'
      );
    } finally {
      setIsCreatingGroup(false);
      setNewGroupName('');
    }
  };

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsCreatingList(false);
      setNewListName('');
    }
  };

  const handleKeyDownGroup = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsCreatingGroup(false);
      setNewGroupName('');
    }
  };

  return (
    <div className="sidebar-footer">
      <div className="footer-left-actions" style={{ flex: 1, marginRight: '8px' }}>
        {isCreatingList ? (
          <form onSubmit={handleSubmitList} className="inline-add-form">
            <Plus size={18} className="inline-add-icon" />
            <input
              ref={listInputRef}
              className="inline-add-input"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onBlur={() => setTimeout(() => { setIsCreatingList(false); setNewListName(''); }, 200)}
              onKeyDown={handleKeyDownList}
              placeholder={language === 'vi' ? 'Tên danh sách...' : 'List name...'}
              autoFocus
            />
          </form>
        ) : isCreatingGroup ? (
          <form onSubmit={handleSubmitGroup} className="inline-add-form">
            <FolderPlus size={18} className="inline-add-icon" />
            <input
              ref={groupInputRef}
              className="inline-add-input"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onBlur={() => setTimeout(() => { setIsCreatingGroup(false); setNewGroupName(''); }, 200)}
              onKeyDown={handleKeyDownGroup}
              placeholder={language === 'vi' ? 'Tên nhóm...' : 'Group name...'}
              autoFocus
            />
          </form>
        ) : (
          <>
            <button 
              className="btn-new-list" 
              onClick={() => setIsCreatingList(true)}
              disabled={createListMutation.isPending}
            >
              <Plus size={18} />
              <span>{language === 'vi' ? 'Danh sách mới' : 'New list'}</span>
            </button>

            <button
              className="btn-new-group"
              onClick={() => setIsCreatingGroup(true)}
              disabled={createGroupMutation.isPending}
              title={language === 'vi' ? 'Tạo nhóm mới' : 'Create new group'}
            >
              <FolderPlus size={18} />
            </button>
          </>
        )}
      </div>

      <div className="sidebar-settings-mini">
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
        </button>
      </div>
    </div>
  );
};
