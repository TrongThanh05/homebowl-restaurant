import { useCallback, useEffect, useMemo, useState } from 'react';
import { LanguageContext, SUPPORTED_LANGS } from './languageContext';
import vi from './locales/vi.json';
import en from './locales/en.json';

const DICTIONARIES = { vi, en };
const DEFAULT_LANG = 'vi';
const STORAGE_KEY = 'app_lang';

function getInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGS.includes(saved) ? saved : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key, params = {}) => {
      const text =
        DICTIONARIES[lang][key] ?? DICTIONARIES[DEFAULT_LANG][key] ?? key;
      return text.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
