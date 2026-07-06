import React, { useEffect, useState } from 'react';
import { SearchBar } from '../search-bar';
import { useTodoListsQuery, useTodoGroupsQuery } from '../../queries/todo.queries';
import { SidebarProfile } from './SidebarProfile';
import { SidebarNav } from './SidebarNav';
import { SidebarFooter } from './SidebarFooter';
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

  const { data: listsData } = useTodoListsQuery();
  const { data: groupsData } = useTodoGroupsQuery();

  const allLists = listsData?.data || [];
  const systemLists = allLists.filter(l => l.isSystem);
  const customLists = allLists.filter(l => !l.isSystem);
  const groups = groupsData?.data || [];

  // Auto-select 'Tasks' list by default if nothing is selected
  useEffect(() => {
    if (!activeListId && systemLists.length > 0) {
      const defaultList = systemLists.find(l => l.name === 'Tasks') || systemLists[0];
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
        />

        {/* BOTTOM ACTIONS & SETTINGS */}
        <SidebarFooter />
      </div>
    </div>
  );
};
