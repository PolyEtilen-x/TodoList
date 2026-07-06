import React from 'react';
import type { TodoList } from '../../types/todo';
import type { TranslationKey } from '../../i18n/translations';

interface AppHeaderProps {
  isSearchMode: boolean;
  search: string;
  selectedList?: TodoList;
  pendingCount: number;
  language: string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isSearchMode,
  search,
  selectedList,
  pendingCount,
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
          <p className="subtitle">
            {language === 'vi' ? `Bạn có ${pendingCount} việc cần làm` : `You have ${pendingCount} tasks pending`}
          </p>
        </>
      ) : (
        <>
          <h1>{t('appTitle')}</h1>
          <p className="subtitle">{t('appSubtitle')}</p>
        </>
      )}
    </header>
  );
};
