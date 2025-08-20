import { en } from './en';
import { fa } from './fa';

export type Language = 'en' | 'fa';

export const translations = {
  en,
  fa,
};

export type TranslationKeys = keyof typeof en;

export { en, fa };
