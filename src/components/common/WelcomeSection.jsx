import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/languageContext';
import { getImage } from '../../utils/images';

const WelcomeSection = () => {
  const { t } = useLanguage();
  return (
    <section className="section-welcome bg1-pattern p-t-120 p-b-105">
      <div className="container">
        <div className="row">
          <div className="col-md-6 p-t-45 p-b-30">
            <div className="wrap-text-welcome t-center">
              <span className="tit2 t-center">{t('welcome.subtitle')}</span>

              <h3 className="tit3 t-center m-b-35 m-t-5">{t('welcome.title')}</h3>

              <p className="t-center m-b-22 size3 m-l-r-auto">
                {t('welcome.text')}
              </p>

              <Link to="/About" className="txt4">
                {t('welcome.story')}
                <i
                  className="fa fa-long-arrow-right m-l-10"
                  aria-hidden="true"
                ></i>
              </Link>
            </div>
          </div>

          <div className="col-md-6 p-b-30">
            <div className="wrap-pic-welcome size2 bo-rad-10 hov-img-zoom m-l-r-auto">
              <img src={getImage('our-story-01.jpg')} alt="IMG-OUR" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
