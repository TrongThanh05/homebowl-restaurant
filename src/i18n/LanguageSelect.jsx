// src/i18n/LanguageSelect.jsx
import { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGS } from './languageContext';
import vnFlag from '../assets/images/icons/vietnam.png';
import ukFlag from '../assets/images/icons/united-kingdom.png';

const FLAG_MAP = {
  vi: vnFlag,
  en: ukFlag,
};

export default function LanguageSelect({ className = '', short = true }) {
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    setLang(code);
    setIsOpen(false);
  };

  const isSidebar = !short || className.includes('sidebar-lang-select');

  return (
    <div
      ref={containerRef}
      className={`lang-select-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      <button
        type="button"
        className={`lang-select ${isSidebar ? 'sidebar-lang-select' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t('language.label')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <img
          src={FLAG_MAP[lang] || vnFlag}
          alt={lang}
          style={{
            width: '18px',
            height: '13px',
            objectFit: 'cover',
            borderRadius: '2px',
            display: 'inline-block',
          }}
        />
        <span>{short ? lang.toUpperCase() : t(`language.${lang}`)}</span>
        <i
          className="fa fa-caret-down"
          style={{
            fontSize: '11px',
            marginLeft: '2px',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'none',
          }}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          className="lang-dropdown-menu"
          role="listbox"
          aria-label={t('language.label')}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            ...(isSidebar
              ? { left: '50%', transform: 'translateX(-50%)' }
              : { right: 0 }),
            zIndex: 1300,
            minWidth: '135px',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.18)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            padding: '4px 0',
            margin: 0,
            listStyle: 'none',
          }}
        >
          {SUPPORTED_LANGS.map((code) => {
            const isSelected = code === lang;
            return (
              <li
                key={code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 12px',
                  fontSize: '13px',
                  fontWeight: isSelected ? '600' : '400',
                  color: isSelected ? '#ec1d25' : '#333333',
                  backgroundColor: isSelected ? '#fbf0f0' : 'transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#f7f7f7';
                    e.currentTarget.style.color = '#ec1d25';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#333333';
                  }
                }}
              >
                <img
                  src={FLAG_MAP[code] || vnFlag}
                  alt={code}
                  style={{
                    width: '18px',
                    height: '13px',
                    objectFit: 'cover',
                    borderRadius: '2px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
                  }}
                />
                <span style={{ flex: 1 }}>{t(`language.${code}`)}</span>
                {isSelected && (
                  <i
                    className="fa fa-check"
                    style={{ fontSize: '11px', color: '#ec1d25' }}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
