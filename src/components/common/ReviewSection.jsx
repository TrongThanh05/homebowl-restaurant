// src/components/common/ReviewSection.jsx
import { useEffect, useState } from 'react';
import SliderLib from 'react-slick';
import { useLanguage } from '../../i18n/languageContext';
import { getImage } from '../../utils/images';
import { getReviews } from '../../services/reviewService';
import AnimatedLayer from './AnimatedLayer';

const Slider = SliderLib.default ?? SliderLib;

const AVATAR_LIST = [
  'avatar-01.jpg',
  'avatar-04.jpg',
  'avatar-05.jpg',
  'avatar-02.jpg',
  'avatar-03.jpg',
];

function NextArrow({ onClick, label }) {
  return (
    <button
      type="button"
      className="arrow-slick3 next-slick3"
      onClick={onClick}
      aria-label={label}
    >
      <i className="fa fa-angle-right" aria-hidden="true"></i>
    </button>
  );
}

function PrevArrow({ onClick, label }) {
  return (
    <button
      type="button"
      className="arrow-slick3 prev-slick3"
      onClick={onClick}
      aria-label={label}
    >
      <i className="fa fa-angle-left" aria-hidden="true"></i>
    </button>
  );
}

const renderStars = (rating = 5) => {
  const count = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
  return Array.from({ length: 5 }, (_, i) => (
    <i
      key={i}
      className={`fa fa-star ${i > 0 ? 'p-l-1' : ''}`}
      aria-hidden="true"
      style={{ opacity: i < count ? 1 : 0.2 }}
    />
  ));
};

const getAvatarUrl = (review, index) => {
  const custom = review.avatar || 'default-avatar.png';
  if (custom) {
    return custom.startsWith('http') ? custom : getImage(custom);
  }
  return getImage(AVATAR_LIST[index % AVATAR_LIST.length]);
};

export default function ReviewSection() {
  const { t, lang } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReviews() {
      try {
        setLoading(true);
        setError(null);
        const data = await getReviews({
          page: 1,
          pageSize: 10,
          lang,
          signal: controller.signal,
        });
        const items = data?.items || [];
        setReviews(items);
        setCurrent(0);
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        console.error('Error fetching reviews:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();

    return () => controller.abort();
  }, [lang]);

  const hasMultiple = reviews.length > 1;

  const settings = {
    fade: true,
    autoplay: hasMultiple,
    autoplaySpeed: 6000,
    speed: 1000,
    infinite: hasMultiple,
    arrows: hasMultiple,
    dots: hasMultiple,
    dotsClass: 'wrap-slick3-dots',
    pauseOnHover: false,
    nextArrow: <NextArrow label={t('common.nextSlide')} />,
    prevArrow: <PrevArrow label={t('common.prevSlide')} />,
    appendDots: (dots) => (
      <div className="wrap-slick3-dots m-t-30">
        <ul className="slick3-dots">{dots}</ul>
      </div>
    ),
    customPaging: (i) => (
      <button type="button" aria-label={t('common.slideN', { n: i + 1 })} />
    ),
    beforeChange: (_oldIndex, newIndex) => setCurrent(newIndex),
    afterChange: (index) => setCurrent(index),
  };

  return (
    <section className="section-review p-t-115">
      <div className="title-review t-center m-b-2">
        <span className="tit2 p-l-15 p-r-15">{t('reviews.subtitle')}</span>

        <h3 className="tit8 t-center p-l-20 p-r-15 p-t-3">
          {t('reviews.title')}
        </h3>
      </div>

      {loading ? (
        <div className="p-t-50 p-b-50 t-center">
          <i
            className="fa fa-spinner fa-spin fa-2x color0 m-b-15"
            aria-hidden="true"
          ></i>
          <p className="txt12">{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="p-t-50 p-b-50 t-center">
          <p className="txt12 text-muted">{t('common.empty')}</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-t-50 p-b-50 t-center">
          <p className="txt12 text-muted">{t('common.empty')}</p>
        </div>
      ) : (
        <div className="wrap-slick3">
          <Slider {...settings} className="slick3">
            {reviews.map((review, index) => {
              const active = index === current;
              return (
                <div key={review.id || index}>
                  <div className={`item-slick3 item${(index % 3) + 1}-slick3`}>
                    <div className="wrap-content-slide3 p-b-50 p-t-50">
                      <div className="container">
                        <AnimatedLayer
                          className="pic-review size14 bo4 wrap-cir-pic m-l-r-auto"
                          appear="zoomIn"
                          active={active}
                          delay={0}
                        >
                          <img
                            src={getAvatarUrl(review, index)}
                            alt={review.full_name || 'Customer'}
                          />
                        </AnimatedLayer>

                        <AnimatedLayer
                          className="content-review m-t-33"
                          appear="fadeInUp"
                          active={active}
                          delay={200}
                        >
                          <p className="t-center txt12 size15 m-l-r-auto">
                            &quot; {review.content} &quot;
                          </p>

                          <div className="star-review fs-18 color0 flex-c-m m-t-12">
                            {renderStars(review.rating)}
                          </div>

                          <div className="more-review txt4 t-center m-t-32">
                            {review.full_name || 'Khách hàng'}
                          </div>
                        </AnimatedLayer>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>
      )}
    </section>
  );
}
