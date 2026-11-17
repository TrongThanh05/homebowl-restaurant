const LOCALES = { vi: 'vi-VN', en: 'en-US' };

export const pickText = (field, lang) =>
  typeof field === 'string' ? field : (field?.[lang] ?? field?.vi ?? '');

export const formatPrice = (value, lang) =>
  new Intl.NumberFormat(LOCALES[lang] ?? LOCALES.vi, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (iso, lang) =>
  new Intl.DateTimeFormat(LOCALES[lang] ?? LOCALES.vi, {
    dateStyle: 'long',
  }).format(new Date(iso));
