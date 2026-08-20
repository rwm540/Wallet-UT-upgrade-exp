import { LanguageCode } from './translations';

const localeMap: Record<LanguageCode, string> = {
  en: 'en-US',
  fa: 'fa-IR',
  ar: 'ar-SA',
  zh: 'zh-CN',
  ru: 'ru-RU',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT'
};

export const formatNumber = (num: number | undefined | null, lang: LanguageCode, options?: Intl.NumberFormatOptions): string => {
  if (num === undefined || num === null) return '';
  return new Intl.NumberFormat(localeMap[lang], options).format(num);
};

export const formatDate = (timestamp: number, lang: LanguageCode): string => {
  return new Date(timestamp).toLocaleDateString(localeMap[lang]);
};