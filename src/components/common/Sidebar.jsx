// src/components/common/Sidebar.jsx
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/languageContext';
import LanguageSelect from '../../i18n/LanguageSelect';
import { galleryThumbnails } from '../../data/gallery.js';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  return (
    <>
      <aside className={`sidebar trans-0-4 ${isOpen ? 'show-sidebar' : ''}`}>
        {/* Nút tắt sidebar */}
        <button
          type="button"
          className="btn-hide-sidebar ti-close color0-hov trans-0-4"
          onClick={onClose}
          aria-label={t('common.closeSidebar')}
        />

        {/* Menu liên kết */}
        <ul className="menu-sidebar p-t-95 p-b-70">
          <li className="t-center m-b-13">
            <LanguageSelect className="sidebar-lang-select" short={false} />
          </li>
          <li className="t-center m-b-13">
            <Link to="/" className="txt19" onClick={onClose}>
              {t('nav.home')}
            </Link>
          </li>
          <li className="t-center m-b-13">
            <Link to="/Menu" className="txt19" onClick={onClose}>
              {t('nav.menu')}
            </Link>
          </li>
          <li className="t-center m-b-13">
            <Link to="/Gallery" className="txt19" onClick={onClose}>
              {t('nav.gallery')}
            </Link>
          </li>
          <li className="t-center m-b-13">
            <Link to="/About" className="txt19" onClick={onClose}>
              {t('nav.about')}
            </Link>
          </li>
          <li className="t-center m-b-13">
            <Link to="/Blog" className="txt19" onClick={onClose}>
              {t('nav.blog')}
            </Link>
          </li>
          <li className="t-center m-b-33">
            <Link to="/Contact" className="txt19" onClick={onClose}>
              {t('nav.contact')}
            </Link>
          </li>

          <li className="t-center">
            <Link
              to="/Reservation"
              className="btn3 flex-c-m size13 txt11 trans-0-4 m-l-r-auto"
              onClick={onClose}
            >
              {t('nav.reservation')}
            </Link>
          </li>
        </ul>

        {/* Mini Gallery */}
        <div className="gallery-sidebar t-center p-l-60 p-r-60 p-b-40">
          <h4 className="txt20 m-b-33">{t('footer.gallery')}</h4>

          <div className="wrap-gallery-sidebar flex-w">
            {galleryThumbnails.map((item, index) => (
              <a
                key={index}
                className="item-gallery-sidebar wrap-pic-w"
                href={item.full}
              >
                <img src={item.thumb} alt="GALLERY" />
              </a>
            ))}
          </div>
        </div>
      </aside>

      {/* Overlay background */}
      <div
        className={`overlay-sidebar trans-0-4 ${isOpen ? 'show-overlay-sidebar' : ''}`}
        onClick={onClose}
      />
    </>
  );
};

export default Sidebar;
