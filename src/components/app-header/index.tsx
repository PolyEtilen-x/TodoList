import React from 'react';
import type { TodoList } from '../../types/todo';
import type { TranslationKey } from '../../i18n/translations';

interface AppHeaderProps {
  isSearchMode: boolean;
  search: string;
  selectedList?: TodoList;
  language: string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isSearchMode,
  search,
  selectedList,
  language,
  t
}) => {
  return (
    <header className="app-header">
      {isSearchMode ? (
        <>
          <h1>{language === 'vi' ? 'Kết quả tìm kiếm' : 'Search Results'}</h1>
          <p className="subtitle">
            {language === 'vi' ? `Hiển thị kết quả cho "${search}"` : `Showing results for "${search}"`}
          </p>
        </>
      ) : selectedList ? (
        <>
          <h1>{selectedList.name}</h1>
        </>
      ) : (
        <>
          <h1>{t('appTitle')}</h1>
        </>
      )}
    </header>
  );
};
