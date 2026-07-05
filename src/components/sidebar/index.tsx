import React, { useEffect, useState } from 'react';
import { X, Moon, Sun, Languages } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './style.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, theme, setTheme, t } = useApp();
  
  // Sync isOpen prop to mounted state in the rendering phase to avoid cascading renders warning
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [mounted, setMounted] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setMounted(true);
    }
  }

  // Handle body scrolling lock and unmounting animation timer
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    } else {
      const timer = setTimeout(() => setMounted(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <div className={`sidebar-backdrop ${isOpen ? 'is-open' : ''}`} onClick={onClose}>
      <div 
        className="sidebar-panel card" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sidebar-header">
          <h3>{t('sidebarTitle')}</h3>
          <button 
            type="button" 
            className="btn btn-secondary btn-icon-only close-btn" 
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-content">
          <div className="settings-section">
            <h4 className="section-title">
              <Languages size={16} className="section-icon" />
              {t('language')}
            </h4>
            <div className="settings-options">
              <button
                type="button"
                className={`option-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                {t('english')}
              </button>
              <button
                type="button"
                className={`option-btn ${language === 'vi' ? 'active' : ''}`}
                onClick={() => setLanguage('vi')}
              >
                {t('vietnamese')}
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h4 className="section-title">
              {theme === 'dark' ? <Moon size={16} className="section-icon" /> : <Sun size={16} className="section-icon" />}
              {t('theme')}
            </h4>
            <div className="settings-options">
              <button
                type="button"
                className={`option-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <Moon size={14} /> {t('dark')}
              </button>
              <button
                type="button"
                className={`option-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <Sun size={14} /> {t('light')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
