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
  const showDateSubtitle = selectedList && !selectedList.isSystem && selectedList.createdAt;
  const formattedDate = showDateSubtitle
    ? new Date(selectedList.createdAt).toLocaleDateString(
        language === 'vi' ? 'vi-VN' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      )
    : '';

  return (
    <header className="app-header">
      {isSearchMode ? (
        <>
          <h1>{t('searchResults')}</h1>
          <p className="subtitle">
            {t('showingResultsFor', { query: search })}
          </p>
        </>
      ) : selectedList ? (
        <>
          <h1>{selectedList.name}</h1>
          {showDateSubtitle && (
            <p className="subtitle">
              {t('createdOn', { date: formattedDate })}
            </p>
          )}
        </>
      ) : (
        <>
          <h1>{t('appTitle')}</h1>
        </>
      )}
    </header>
  );
};
