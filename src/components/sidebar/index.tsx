import React, { useEffect, useState } from 'react';
import { 
  X, Moon, Sun, Languages, 
  Sun as SunIcon, Star, User, Home, List, Folder, Plus 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SearchBar } from '../search-bar';
import './style.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  onSearch: (value: string) => void;
  totalTasks: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, search, onSearch, totalTasks }) => {
  const { language, setLanguage, theme, setTheme, t } = useApp();
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 768);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 769px)');
    const listener = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [mounted, setMounted] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setMounted(true);
    }
  }

  useEffect(() => {
    if (isDesktop) {
      document.body.style.overflow = '';
      return;
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
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
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isDesktop]);

  const shouldRender = isDesktop || mounted;
  if (!shouldRender) return null;

  return (
    <div 
      className={`sidebar-backdrop ${isDesktop ? 'is-desktop' : ''} ${isOpen ? 'is-open' : ''}`} 
      onClick={isDesktop ? undefined : onClose}
    >
      <div 
        className="sidebar-panel" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER: User Profile */}
        <div className="sidebar-profile">
          <div className="profile-avatar">
            <span>TH</span>
          </div>
          <div className="profile-info">
            <h3 className="profile-name">Tôn Nguyễn Hồng</h3>
            <p className="profile-email">nguyenhongtonpy2004@gmail.com</p>
          </div>
          {!isDesktop && (
            <button 
              type="button" 
              className="btn btn-secondary btn-icon-only close-btn" 
              onClick={onClose}
              aria-label="Close settings"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* SEARCH BAR */}
        <div className="sidebar-search">
          <SearchBar value={search} onSearch={onSearch} />
        </div>

        {/* MAIN NAVIGATION */}
        <div className="sidebar-nav scrollable">
          <div className="nav-group">
            <button className="nav-item">
              <SunIcon size={18} className="nav-icon" />
              <span className="nav-label">My Day</span>
            </button>
            <button className="nav-item">
              <Star size={18} className="nav-icon" style={{ color: 'var(--danger)' }} />
              <span className="nav-label">Important</span>
            </button>
            <button className="nav-item">
              <User size={18} className="nav-icon" style={{ color: 'var(--success)' }} />
              <span className="nav-label">Assigned to me</span>
            </button>
            <button className="nav-item active">
              <Home size={18} className="nav-icon" style={{ color: 'var(--primary)' }} />
              <span className="nav-label">Tasks</span>
              {totalTasks > 0 && <span className="nav-badge">{totalTasks}</span>}
            </button>
          </div>

          <div className="nav-divider" />

          <div className="nav-group">
            <button className="nav-item">
              <List size={18} className="nav-icon" />
              <span className="nav-label">Untitled list</span>
              <span className="nav-badge">4</span>
            </button>
            <button className="nav-item">
              <Folder size={18} className="nav-icon" />
              <span className="nav-label">Untitled group</span>
            </button>
            <button className="nav-item">
              <List size={18} className="nav-icon" />
              <span className="nav-label">7/4/2026</span>
              <span className="nav-badge">3</span>
            </button>
            <button className="nav-item">
              <List size={18} className="nav-icon" />
              <span className="nav-label">17/4/26</span>
              <span className="nav-badge">7</span>
            </button>
            <button className="nav-item">
              <List size={18} className="nav-icon" />
              <span className="nav-label">Untitled list (1)</span>
              <span className="nav-badge">3</span>
            </button>
            <button className="nav-item">
              <List size={18} className="nav-icon" />
              <span className="nav-label">StudyJapane</span>
            </button>
          </div>
        </div>

        {/* BOTTOM ACTIONS & SETTINGS */}
        <div className="sidebar-footer">
          <button className="btn-new-list">
            <Plus size={18} />
            <span>New list</span>
          </button>
          
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
      </div>
    </div>
  );
};
