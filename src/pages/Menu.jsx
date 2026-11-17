// src/pages/Menu.jsx
import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/languageContext';
import { formatPrice } from '../i18n/format';
import { getImage } from '../utils/images';
import SignUpSection from '../components/common/SignUpSection';
import { getMenuItems } from '../services/menuService';

const MenuItem = ({ name, price, description, lang }) => (
  <div className="item-mainmenu m-b-36">
    <div className="flex-w flex-b m-b-3">
      <a
        href="#menu"
        onClick={(e) => e.preventDefault()}
        className="name-item-mainmenu txt21"
      >
        {name}
      </a>
      <div className="line-item-mainmenu bg3-pattern"></div>
      <div className="price-item-mainmenu txt22">{formatPrice(price, lang)}</div>
    </div>
    <span className="info-item-mainmenu txt23">{description}</span>
  </div>
);

const BlockMeal = ({ name, description, price, image, image_url, lang }) => {
  const imgSrc = image_url
    ? image_url.startsWith('http')
      ? image_url
      : getImage(image_url)
    : image
      ? getImage(image)
      : getImage('lunch-01.jpg');

  return (
    <div className="blo3 flex-w flex-col-l-sm m-b-30">
      <div className="pic-blo3 size20 bo-rad-10 hov-img-zoom m-r-28">
        <a href="#meal" onClick={(e) => e.preventDefault()}>
          <img src={imgSrc} alt={name} />
        </a>
      </div>

      <div className="text-blo3 size21 flex-col-l-m">
        <a
          href="#meal"
          onClick={(e) => e.preventDefault()}
          className="txt21 m-b-3"
        >
          {name}
        </a>
        <span className="txt23">{description}</span>
        <span className="txt22 m-t-20">{formatPrice(price, lang)}</span>
      </div>
    </div>
  );
};

export default function Menu() {
  const { t, lang } = useLanguage();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchMenu() {
      try {
        setLoading(true);
        setError(null);
        const data = await getMenuItems({ page: 1, pageSize: 100, lang, signal: controller.signal });
        if (data?.items) {
          setMenuItems(data.items);
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        console.error('Error loading menu:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
    return () => controller.abort();
  }, [lang]);

  // Phân nhóm theo section ổn định (không phụ thuộc ngôn ngữ)
  const bySection = (code) => menuItems.filter((item) => item.section === code);
  const starters = bySection('starters');
  const drinks = bySection('drinks');
  const desserts = bySection('desserts');
  const mains = bySection('mains');
  const lunch = bySection('lunch');
  const dinner = bySection('dinner');

  return (
    <>
      {/* Title Page */}
      <section
        className="bg-title-page flex-c-m p-t-160 p-b-80 p-l-15 p-r-15"
        style={{ backgroundImage: `url(${getImage('bg-title-page-01.jpg')})` }}
      >
        <h2 className="tit6 t-center">{t('menu.pageTitle')}</h2>
      </section>

      {/* Trạng thái Loading / Lỗi */}
      {loading && (
        <div className="t-center p-t-40 p-b-20 txt23">
          <i className="fa fa-spinner fa-spin m-r-8"></i> {t('menu.loading')}
        </div>
      )}

      {error && !loading && (
        <div className="container p-t-30 p-b-20">
          <div className="alert alert-danger t-center" role="alert">
            <i className="fa fa-exclamation-triangle m-r-8"></i>
            {t('menu.error')}
          </div>
        </div>
      )}

      {/* Main menu */}
      <section className="section-mainmenu p-t-110 p-b-70 bg1-pattern">
        <div className="container">
          <div className="row">
            {/* Cột trái: Starters & Drinks */}
            <div className="col-md-10 col-lg-6 p-r-35 p-r-15-lg m-l-r-auto">
              <div className="wrap-item-mainmenu p-b-22">
                <h3 className="tit-mainmenu tit10 p-b-25">{t('menu.starters')}</h3>
                {starters.length > 0 ? (
                  starters.map((item) => (
                    <MenuItem key={item.id} {...item} lang={lang} />
                  ))
                ) : (
                  !loading && <p className="txt23 p-b-20">{t('menu.empty.starters')}</p>
                )}
              </div>

              <div className="wrap-item-mainmenu p-b-22">
                <h3 className="tit-mainmenu tit10 p-b-25">{t('menu.drinks')}</h3>
                {drinks.length > 0 ? (
                  drinks.map((item) => (
                    <MenuItem key={item.id} {...item} lang={lang} />
                  ))
                ) : (
                  !loading && <p className="txt23 p-b-20">{t('menu.empty.drinks')}</p>
                )}
              </div>
            </div>

            {/* Cột phải: Desserts & Main */}
            <div className="col-md-10 col-lg-6 p-l-35 p-l-15-lg m-l-r-auto">
              <div className="wrap-item-mainmenu p-b-22">
                <h3 className="tit-mainmenu tit10 p-b-25">{t('menu.desserts')}</h3>
                {desserts.length > 0 ? (
                  desserts.map((item) => (
                    <MenuItem key={item.id} {...item} lang={lang} />
                  ))
                ) : (
                  !loading && <p className="txt23 p-b-20">{t('menu.empty.desserts')}</p>
                )}
              </div>

              <div className="wrap-item-mainmenu p-b-22">
                <h3 className="tit-mainmenu tit10 p-b-25">{t('menu.mains')}</h3>
                {mains.length > 0 ? (
                  mains.map((item) => (
                    <MenuItem key={item.id} {...item} lang={lang} />
                  ))
                ) : (
                  !loading && <p className="txt23 p-b-20">{t('menu.empty.mains')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lunch */}
      <section className="section-lunch bgwhite">
        <div
          className="header-lunch parallax0 parallax100"
          style={{ backgroundImage: `url(${getImage('header-menu-01.jpg')})` }}
        >
          <div className="bg1-overlay t-center p-t-170 p-b-165">
            <h2 className="tit4 t-center">{t('menu.lunch')}</h2>
          </div>
        </div>

        <div className="container">
          <div className="row p-t-108 p-b-70">
            {lunch.length > 0 ? (
              <>
                <div className="col-md-8 col-lg-6 m-l-r-auto">
                  {lunch.slice(0, Math.ceil(lunch.length / 2)).map((item) => (
                    <BlockMeal key={item.id} {...item} lang={lang} />
                  ))}
                </div>

                <div className="col-md-8 col-lg-6 m-l-r-auto">
                  {lunch.slice(Math.ceil(lunch.length / 2)).map((item) => (
                    <BlockMeal key={item.id} {...item} lang={lang} />
                  ))}
                </div>
              </>
            ) : (
              !loading && (
                <div className="col-12 t-center txt23 p-t-30 p-b-30">
                  {t('menu.empty.lunch')}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Dinner */}
      <section className="section-dinner bgwhite">
        <div
          className="header-dinner parallax0 parallax100"
          style={{ backgroundImage: `url(${getImage('header-menu-02.jpg')})` }}
        >
          <div className="bg1-overlay t-center p-t-170 p-b-165">
            <h2 className="tit4 t-center">{t('menu.dinner')}</h2>
          </div>
        </div>

        <div className="container">
          <div className="row p-t-108 p-b-70">
            {dinner.length > 0 ? (
              <>
                <div className="col-md-8 col-lg-6 m-l-r-auto">
                  {dinner.slice(0, Math.ceil(dinner.length / 2)).map((item) => (
                    <BlockMeal key={item.id} {...item} lang={lang} />
                  ))}
                </div>

                <div className="col-md-8 col-lg-6 m-l-r-auto">
                  {dinner.slice(Math.ceil(dinner.length / 2)).map((item) => (
                    <BlockMeal key={item.id} {...item} lang={lang} />
                  ))}
                </div>
              </>
            ) : (
              !loading && (
                <div className="col-12 t-center txt23 p-t-30 p-b-30">
                  {t('menu.empty.dinner')}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Sign up */}
      <SignUpSection />
    </>
  );
}
