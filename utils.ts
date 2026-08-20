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

export const formatTokenPrice = (val: number | undefined | null, lang: LanguageCode): string => {
  if (val === undefined || val === null) return '0';
  if (val === 0) return '0.00';
  if (val < 0.0001) {
    return formatNumber(val, lang, { minimumFractionDigits: 7, maximumFractionDigits: 8 });
  }
  if (val < 1) {
    return formatNumber(val, lang, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }
  return formatNumber(val, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatDate = (timestamp: number, lang: LanguageCode): string => {
  return new Date(timestamp).toLocaleDateString(localeMap[lang]);
};