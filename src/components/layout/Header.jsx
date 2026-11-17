// src/components/layout/Header.jsx
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../i18n/languageContext';
import LanguageSelect from '../../i18n/LanguageSelect';
import logo from '../../assets/images/icons/logo.png';
import logo2 from '../../assets/images/icons/logo2.png';

const links = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/Menu', labelKey: 'nav.menu' },
  { to: '/Reservation', labelKey: 'nav.reservation' },
  { to: '/Gallery', labelKey: 'nav.gallery' },
  { to: '/About', labelKey: 'nav.about' },
  { to: '/Blog', labelKey: 'nav.blog' },
  { to: '/Contact', labelKey: 'nav.contact' },
];

const Header = ({ onOpenSidebar }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const [hasBackground, setHasBackground] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Tìm kích thước slider trên trang Home hoặc banner tiêu đề trên các trang khác
      const slider = document.querySelector('.section-slide');
      let threshold;

      if (slider) {
        // Khi lăn chuột xuống dưới cùng của kích thước slider
        threshold = slider.offsetTop + slider.offsetHeight - 90;
      } else {
        const titlePage = document.querySelector('.bg-title-page');
        threshold = titlePage
          ? titlePage.offsetTop + titlePage.offsetHeight - 90
          : 100;
      }

      const currentScrollY =
        window.pageYOffset || document.documentElement.scrollTop;
      setHasBackground(currentScrollY >= threshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname]);

  return (
    <header className={hasBackground ? 'header-fixed' : ''}>
      <div
        className={`wrap-menu-header ${hasBackground ? '' : 'gradient1'} trans-0-4`}
      >
        <div className="container h-full">
          <div className="wrap_header trans-0-3 flex-nowrap">
            <div className="logo flex-shrink-0">
              <Link to="/" className="logo">
                <img
                  src={hasBackground ? logo2 : logo}
                  alt="IMG-LOGO"
                  className="trans-0-3"
                />
              </Link>
            </div>

            <div className="wrap_menu">
              <nav className="menu">
                <ul className="main_menu">
                  {links.map(({ to, labelKey }) => (
                    <li key={to}>
                      <NavLink to={to} end={to === '/'}>
                        {t(labelKey)}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="social flex-l-m flex-shrink-0">
              <a href="#" aria-label="Tripadvisor">
                <i className="fab fa-tripadvisor" aria-hidden="true"></i>
              </a>
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f m-l-12" aria-hidden="true"></i>
              </a>
              <a href="#" aria-label="Twitter">
                <i className="fab fa-twitter m-l-12" aria-hidden="true"></i>
              </a>

              <LanguageSelect className="m-l-14" short={true} />

              <button
                type="button"
                className="btn-show-sidebar m-l-18 trans-0-4"
                onClick={onOpenSidebar}
                aria-label={t('common.openSidebar')}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
