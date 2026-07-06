import React from 'react';
import { Languages, Moon, Sun } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import './style.css';

export const SidebarFooter: React.FC = () => {
  const { language, setLanguage, theme, setTheme, t } = useApp();

  return (
    <div className="sidebar-footer">
      <div className="footer-row-settings">
        <button
          type="button"
          className="mini-setting-btn"
          onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
          title={t('language')}
        >
          <Languages size={13} />
          <span>{language.toUpperCase()}</span>
        </button>
        <button
          type="button"
          className="mini-setting-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={t('theme')}
        >
          {theme === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
          <span>{theme === 'dark' ? (language === 'vi' ? 'Tối' : 'Dark') : (language === 'vi' ? 'Sáng' : 'Light')}</span>
        </button>
      </div>
    </div>
  );
};
