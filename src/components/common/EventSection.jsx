// src/components/common/EventSection.jsx
import { useEffect, useState, useMemo } from 'react';
import SliderLib from 'react-slick';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/languageContext';
import AnimatedLayer from './AnimatedLayer';
import { getImage } from '../../utils/images';
import { eventsData } from '../../data/events';
import { getEvents } from '../../services/eventService';

const Slider = SliderLib.default ?? SliderLib;

function NextArrow({ onClick, label }) {
  return (
    <button
      type="button"
      className="arrow-slick2 next-slick2"
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
      className="arrow-slick2 prev-slick2"
      onClick={onClick}
      aria-label={label}
    >
      <i className="fa fa-angle-left" aria-hidden="true"></i>
    </button>
  );
}

const formatEventTime = (eventAt, lang = 'vi') => {
  if (!eventAt) return '';
  const date = new Date(eventAt);
  if (isNaN(date.getTime())) return eventAt;

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = String(hours % 12 || 12).padStart(2, '0');
  const timeStr = `${h12}:${minutes} ${ampm}`;

  if (lang === 'en') {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${timeStr} ${weekday} - ${day} ${month} ${year}`;
  }

  const weekday = date.toLocaleDateString('vi-VN', { weekday: 'long' });
  const day = date.getDate();
  const month = date.toLocaleDateString('vi-VN', { month: 'long' });
  const year = date.getFullYear();
  return `${timeStr} ${weekday} - ${day} ${month} ${year}`;
};

const getCountdown = (targetDate, fallbackCountdown) => {
  if (!targetDate) {
    return fallbackCountdown || { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const target = new Date(targetDate).getTime();
  if (isNaN(target)) {
    return fallbackCountdown || { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

export default function EventSection() {
  const [current, setCurrent] = useState(0);
  const { t, lang } = useLanguage();
  const [events, setEvents] = useState([]);
  const [, setTick] = useState(0);

  // Live countdown update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch events from backend API with fallback
  useEffect(() => {
    const controller = new AbortController();

    async function fetchEvents() {
      try {
        const data = await getEvents({
          page: 1,
          pageSize: 10,
          lang,
          signal: controller.signal,
        });
        const items = data?.items || [];
        if (items.length > 0) {
          setEvents(items);
        } else {
          setEvents(eventsData);
        }
        setCurrent(0);
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        console.error('Error fetching events:', err);
        setEvents(eventsData);
      }
    }

    fetchEvents();

    return () => controller.abort();
  }, [lang]);

  const displayEvents = events.length > 0 ? events : eventsData;
  const hasMultiple = displayEvents.length > 1;

  const sliderKey = useMemo(
    () => `${lang}-${displayEvents.map((e) => e.id).join(',')}`,
    [lang, displayEvents],
  );

  const settings = {
    fade: true,
    autoplay: hasMultiple,
    autoplaySpeed: 6000,
    speed: 1000,
    infinite: hasMultiple,
    arrows: hasMultiple,
    dots: hasMultiple,
    dotsClass: 'wrap-slick2-dots',
    pauseOnHover: false,
    nextArrow: <NextArrow label={t('common.nextSlide')} />,
    prevArrow: <PrevArrow label={t('common.prevSlide')} />,
    appendDots: (dots) => (
      <div className="wrap-slick2-dots">
        <ul className="slick2-dots">{dots}</ul>
      </div>
    ),
    customPaging: (i) => (
      <button type="button" aria-label={t('common.slideN', { n: i + 1 })} />
    ),
    beforeChange: (_oldIndex, newIndex) => setCurrent(newIndex),
    afterChange: (index) => setCurrent(index),
  };

  return (
    <section className="section-event">
      <div className="wrap-slick2">
        <Slider key={sliderKey} {...settings} className="slick2">
          {displayEvents.map((event, index) => {
            const active = index === current;
            const bgImage = event.bg_image || event.bgImage || 'bg-event-01.jpg';
            const image = event.image || 'event-02.jpg';
            const itemClass =
              event.itemClass || `item${(index % 3) + 1}-slick2`;
            const bgBloClass =
              event.bgBloClass || `bg${(index % 3) + 1}-blo2`;
            const animation =
              event.animation ||
              (index === 0
                ? 'zoomIn'
                : index === 1
                ? 'fadeInDown'
                : 'rotateInUpLeft');
            const time =
              event.time || formatEventTime(event.event_at, lang);
            const countdown = getCountdown(event.event_at, event.countdown);
            const link = event.link_url || event.link || '#';

            return (
              <div key={event.id || index}>
                <div
                  className={`item-slick2 ${itemClass}`}
                  style={{ backgroundImage: `url(${getImage(bgImage)})` }}
                >
                  <div className="wrap-content-slide2 p-t-115 p-b-208">
                    <div className="container">
                      <div className="title-event t-center m-b-52">
                        <span className="tit2 p-l-15 p-r-15">{t('events.subtitle')}</span>

                        <h3 className="tit6 t-center p-l-15 p-r-15 p-t-3">
                          {t('events.title')}
                        </h3>
                      </div>

                      <AnimatedLayer
                        className="blo2 flex-w flex-str flex-col-c-m-lg"
                        appear={animation}
                        active={active}
                        delay={0}
                      >
                        <Link
                          to={link}
                          className={`wrap-pic-blo2 ${bgBloClass}`}
                          style={{
                            backgroundImage: `url(${getImage(image)})`,
                          }}
                        >
                          <div className="time-event size10 txt6 effect1">
                            <span className="txt-effect1 flex-c-m t-center">
                              {time}
                            </span>
                          </div>
                        </Link>

                        <div className="wrap-text-blo2 flex-col-c-m p-l-40 p-r-40 p-t-45 p-b-30">
                          <h4 className="tit7 t-center m-b-10">
                            {event.title}
                          </h4>

                          <p className="t-center">{event.description}</p>

                          <div className="flex-sa-m flex-w w-full m-t-40">
                            <div className="size11 flex-col-c-m">
                              <span className="dis-block t-center txt7 m-b-2 days">
                                {countdown?.days ?? 0}
                              </span>

                              <span className="dis-block t-center txt8">
                                {t('events.days')}
                              </span>
                            </div>

                            <div className="size11 flex-col-c-m">
                              <span className="dis-block t-center txt7 m-b-2 hours">
                                {countdown?.hours ?? 0}
                              </span>

                              <span className="dis-block t-center txt8">
                                {t('events.hours')}
                              </span>
                            </div>

                            <div className="size11 flex-col-c-m">
                              <span className="dis-block t-center txt7 m-b-2 minutes">
                                {countdown?.minutes ?? 0}
                              </span>

                              <span className="dis-block t-center txt8">
                                {t('events.minutes')}
                              </span>
                            </div>

                            <div className="size11 flex-col-c-m">
                              <span className="dis-block t-center txt7 m-b-2 seconds">
                                {countdown?.seconds ?? 0}
                              </span>

                              <span className="dis-block t-center txt8">
                                {t('events.seconds')}
                              </span>
                            </div>
                          </div>

                          <Link to={link} className="txt4 m-t-40">
                            {t('common.viewDetails')}
                            <i
                              className="fa fa-long-arrow-right m-l-10"
                              aria-hidden="true"
                            ></i>
                          </Link>
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
    </section>
  );
}
