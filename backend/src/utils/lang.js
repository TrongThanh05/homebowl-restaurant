// src/utils/lang.js
// Language resolution utility for i18n

export const SUPPORTED_LANGS = ['vi', 'en'];
export const DEFAULT_LANG = 'vi';

/**
 * Resolve language from request:
 *   1) ?lang= query parameter
 *   2) Accept-Language header (first 2 chars)
 *   3) Default 'vi'
 *
 * Only returns values from the whitelist → safe for SQL parameters.
 */
export function resolveLang(req) {
  const fromQuery = new URL(req.url, 'http://localhost').searchParams.get('lang');
  if (SUPPORTED_LANGS.includes(fromQuery)) return fromQuery;

  const first = (req.headers['accept-language'] ?? '')
    .split(',')[0]
    ?.trim()
    .slice(0, 2)
    .toLowerCase();
  return SUPPORTED_LANGS.includes(first) ? first : DEFAULT_LANG;
}
