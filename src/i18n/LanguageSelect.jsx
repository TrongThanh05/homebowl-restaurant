// src/i18n/LanguageSelect.jsx
import { useLanguage, SUPPORTED_LANGS } from './languageContext';

export default function LanguageSelect({ className = '', short = true }) {
  const { lang, setLang, t } = useLanguage();
  return (
    <select
      className={`lang-select ${className}`}
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      aria-label={t('language.label')}
    >
      {SUPPORTED_LANGS.map((code) => (
        <option key={code} value={code}>
          {short ? code.toUpperCase() : t(`language.${code}`)}
        </option>
      ))}
    </select>
  );
}
