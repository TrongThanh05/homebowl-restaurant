// src/pages/Menu.jsx
import { getImage } from '../utils/images';
import { mainMenuData, lunchData, dinnerData } from '../data/menu';
import SignUpSection from '../components/common/SignUpSection';

const MenuItem = ({ name, price, description }) => (
  <div className="item-mainmenu m-b-36">
    <div className="flex-w flex-b m-b-3">
      <a href="#menu" onClick={(e) => e.preventDefault()} className="name-item-mainmenu txt21">
        {name}
      </a>
      <div className="line-item-mainmenu bg3-pattern"></div>
      <div className="price-item-mainmenu txt22">{price}</div>
    </div>
    <span className="info-item-mainmenu txt23">{description}</span>
  </div>
);

const BlockMeal = ({ name, description, price, image }) => (
  <div className="blo3 flex-w flex-col-l-sm m-b-30">
    <div className="pic-blo3 size20 bo-rad-10 hov-img-zoom m-r-28">
      <a href="#meal" onClick={(e) => e.preventDefault()}>
        <img src={getImage(image)} alt="IMG-MENU" />
      </a>
    </div>

    <div className="text-blo3 size21 flex-col-l-m">
      <a href="#meal" onClick={(e) => e.preventDefault()} className="txt21 m-b-3">
        {name}
      </a>
      <span className="txt23">{description}</span>
      <span className="txt22 m-t-20">{price}</span>
    </div>
  </div>
);

export default function Menu() {
  return (
    <>
      {/* Title Page */}
      <section
        className="bg-title-page flex-c-m p-t-160 p-b-80 p-l-15 p-r-15"
        style={{ backgroundImage: `url(${getImage('bg-title-page-01.jpg')})` }}
      >
        <h2 className="tit6 t-center">Pato Menu</h2>
      </section>

      {/* Main menu */}
      <section className="section-mainmenu p-t-110 p-b-70 bg1-pattern">
        <div className="container">
          <div className="row">
            {/* Cột trái: Starters & Drinks */}
            <div className="col-md-10 col-lg-6 p-r-35 p-r-15-lg m-l-r-auto">
              <div className="wrap-item-mainmenu p-b-22">
                <h3 className="tit-mainmenu tit10 p-b-25">STARTERS</h3>
                {mainMenuData.starters.map((item, index) => (
                  <MenuItem key={index} {...item} />
                ))}
              </div>

              <div className="wrap-item-mainmenu p-b-22">
                <h3 className="tit-mainmenu tit10 p-b-25">DRINKS</h3>
                {mainMenuData.drinks.map((item, index) => (
                  <MenuItem key={index} {...item} />
                ))}
              </div>
            </div>

            {/* Cột phải: Desserts & Main */}
            <div className="col-md-10 col-lg-6 p-l-35 p-l-15-lg m-l-r-auto">
              <div className="wrap-item-mainmenu p-b-22">
                <h3 className="tit-mainmenu tit10 p-b-25">DESSERT</h3>
                {mainMenuData.desserts.map((item, index) => (
                  <MenuItem key={index} {...item} />
                ))}
              </div>

              <div className="wrap-item-mainmenu p-b-22">
                <h3 className="tit-mainmenu tit10 p-b-25">MAIN</h3>
                {mainMenuData.mains.map((item, index) => (
                  <MenuItem key={index} {...item} />
                ))}
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
            <h2 className="tit4 t-center">Lunch</h2>
          </div>
        </div>

        <div className="container">
          <div className="row p-t-108 p-b-70">
            <div className="col-md-8 col-lg-6 m-l-r-auto">
              {lunchData.slice(0, 3).map((item, index) => (
                <BlockMeal key={index} {...item} />
              ))}
            </div>

            <div className="col-md-8 col-lg-6 m-l-r-auto">
              {lunchData.slice(3, 6).map((item, index) => (
                <BlockMeal key={index} {...item} />
              ))}
            </div>
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
            <h2 className="tit4 t-center">Dinner</h2>
          </div>
        </div>

        <div className="container">
          <div className="row p-t-108 p-b-70">
            <div className="col-md-8 col-lg-6 m-l-r-auto">
              {dinnerData.slice(0, 3).map((item, index) => (
                <BlockMeal key={index} {...item} />
              ))}
            </div>

            <div className="col-md-8 col-lg-6 m-l-r-auto">
              {dinnerData.slice(3, 6).map((item, index) => (
                <BlockMeal key={index} {...item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sign up */}
      <SignUpSection />
    </>
  );
}
