import en from './en.json';
import vi from './vi.json';

export const translations = {
  en,
  vi,
};

export type Language = 'en' | 'vi';
export type TranslationKey = keyof typeof en;
