// src/pages/About.jsx
import { useState, useEffect } from 'react';
import { getImage } from '../utils/images';
import { useLanguage } from '../i18n/languageContext';
import SignUpSection from '../components/common/SignUpSection';
import VideoModal from '../components/common/VideoModal';
import VideoSection from '../components/common/VideoSection';
import { getEmployees } from '../services/employeeService';

const CHEF_DEFAULT_AVATARS = ['avatar-02.jpg', 'avatar-03.jpg', 'avatar-05.jpg'];

const getChefAvatar = (chef, index) => {
  const custom = chef.avatar_url || chef.avatar;
  if (custom) {
    return custom.startsWith('http') ? custom : getImage(custom);
  }
  return getImage(CHEF_DEFAULT_AVATARS[index % CHEF_DEFAULT_AVATARS.length]);
};

export default function About() {
  const { t, lang } = useLanguage();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [chefs, setChefs] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchChefs() {
      try {
        const data = await getEmployees({
          role: 'chef',
          lang,
          signal: controller.signal,
        });
        const items = data?.items || [];
        setChefs(items);
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        console.error('Error fetching chefs:', err);
      }
    }

    fetchChefs();

    return () => controller.abort();
  }, [lang]);

  return (
    <>
      {/* Title Page */}
      <section
        className="bg-title-page flex-c-m p-t-160 p-b-80 p-l-15 p-r-15"
        style={{ backgroundImage: `url(${getImage('bg-title-page-03.jpg')})` }}
      >
        <h2 className="tit6 t-center">{t('about.pageTitle')}</h2>
      </section>

      {/* Our Story */}
      <section className="bg2-pattern p-t-116 p-b-110 t-center p-l-15 p-r-15">
        <span className="tit2 t-center">{t('welcome.subtitle')}</span>

        <h3 className="tit3 t-center m-b-35 m-t-5">{t('welcome.story')}</h3>

        <p className="t-center size32 m-l-r-auto">{t('about.story.text')}</p>
      </section>

      {/* Video */}
      <VideoSection
        bgImage="header-menu-01.jpg"
        onOpenVideo={() => setIsVideoOpen(true)}
      />

      {/* Delicious & Romantic */}
      <section className="bg1-pattern p-t-120 p-b-105">
        <div className="container">
          {/* Delicious */}
          <div className="row">
            <div className="col-md-6 p-t-45 p-b-30">
              <div className="wrap-text-delicious t-center">
                <span className="tit2 t-center">
                  {t('about.recipes.kicker')}
                </span>

                <h3 className="tit3 t-center m-b-35 m-t-5">
                  {t('about.recipes.title')}
                </h3>

                <p className="t-center m-b-22 size3 m-l-r-auto">
                  {t('about.recipes.text')}
                </p>
              </div>
            </div>

            <div className="col-md-6 p-b-30">
              <div className="wrap-pic-delicious size2 bo-rad-10 hov-img-zoom m-l-r-auto">
                <img src={getImage('our-story-01.jpg')} alt="IMG-OUR" />
              </div>
            </div>
          </div>

          {/* Romantic */}
          <div className="row p-t-170">
            <div className="col-md-6 p-b-30">
              <div className="wrap-pic-romantic size2 bo-rad-10 hov-img-zoom m-l-r-auto">
                <img src={getImage('our-story-02.jpg')} alt="IMG-OUR" />
              </div>
            </div>

            <div className="col-md-6 p-t-45 p-b-30">
              <div className="wrap-text-romantic t-center">
                <span className="tit2 t-center">
                  {t('about.romantic.kicker')}
                </span>

                <h3 className="tit3 t-center m-b-35 m-t-5">
                  {t('about.romantic.title')}
                </h3>

                <p className="t-center m-b-22 size3 m-l-r-auto">
                  {t('about.romantic.text')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner */}
      <div
        className="parallax0 parallax100"
        style={{ backgroundImage: `url(${getImage('bg-cover-video-02.jpg')})` }}
      >
        <div className="overlay0-parallax t-center size33"></div>
      </div>

      {/* Chef */}
      <section className="section-chef bgwhite p-t-115 p-b-95">
        <div className="container t-center">
          <span className="tit2 t-center">{t('about.chef.meetOur')}</span>

          <h3 className="tit5 t-center m-b-50 m-t-5">{t('about.chef.chef')}</h3>

          <div className="row">
            {chefs.map((chef, index) => (
              <div
                key={chef.id || index}
                className="col-md-8 col-lg-4 m-l-r-auto p-b-30"
              >
                <div className="blo5 pos-relative p-t-60">
                  <div className="pic-blo5 size14 bo4 wrap-cir-pic hov-img-zoom ab-c-t">
                    <a href="#chef" onClick={(e) => e.preventDefault()}>
                      <img
                        src={getChefAvatar(chef, index)}
                        alt={chef.name || chef.full_name || 'Chef'}
                      />
                    </a>
                  </div>

                  <div className="text-blo5 size34 t-center bo-rad-10 bo7 p-t-90 p-l-35 p-r-35 p-b-30">
                    <a
                      href="#chef"
                      onClick={(e) => e.preventDefault()}
                      className="txt34 dis-block p-b-6"
                    >
                      {chef.name || chef.full_name}
                    </a>

                    <span className="dis-block t-center txt35 p-b-25">
                      {chef.title || chef.position}
                    </span>

                    <p className="t-center">{chef.description || chef.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sign up */}
      <SignUpSection />

      {/* Video Modal */}
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </>
  );
}
