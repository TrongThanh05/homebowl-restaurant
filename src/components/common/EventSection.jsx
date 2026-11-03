// src/components/common/EventSection.jsx
import { useState } from 'react';
import SliderLib from 'react-slick';
import { Link } from 'react-router-dom';
import AnimatedLayer from './AnimatedLayer';
import { getImage } from '../../utils/images';
import { eventsData } from '../../data/events';

const Slider = SliderLib.default ?? SliderLib;

function NextArrow({ onClick }) {
  return (
    <button
      type="button"
      className="arrow-slick2 next-slick2"
      onClick={onClick}
      aria-label="Next slide"
    >
      <i className="fa fa-angle-right" aria-hidden="true"></i>
    </button>
  );
}

function PrevArrow({ onClick }) {
  return (
    <button
      type="button"
      className="arrow-slick2 prev-slick2"
      onClick={onClick}
      aria-label="Previous slide"
    >
      <i className="fa fa-angle-left" aria-hidden="true"></i>
    </button>
  );
}

export default function EventSection() {
  const [current, setCurrent] = useState(0);

  const settings = {
    fade: true,
    autoplay: true,
    autoplaySpeed: 6000,
    speed: 1000,
    infinite: true,
    arrows: true,
    dots: true,
    dotsClass: 'wrap-slick2-dots',
    pauseOnHover: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    appendDots: (dots) => (
      <div className="wrap-slick2-dots">
        <ul className="slick2-dots">{dots}</ul>
      </div>
    ),
    customPaging: (i) => <button type="button" aria-label={`Slide ${i + 1}`} />,
    beforeChange: (_oldIndex, newIndex) => setCurrent(newIndex),
    afterChange: (index) => setCurrent(index),
  };

  return (
    <section className="section-event">
      <div className="wrap-slick2">
        <Slider {...settings} className="slick2">
          {eventsData.map((event, index) => {
            const active = index === current;
            return (
              <div key={event.id}>
                <div
                  className={`item-slick2 ${event.itemClass || ''}`}
                  style={{ backgroundImage: `url(${getImage(event.bgImage)})` }}
                >
                  <div className="wrap-content-slide2 p-t-115 p-b-208">
                    <div className="container">
                      <div className="title-event t-center m-b-52">
                        <span className="tit2 p-l-15 p-r-15">Upcomming</span>

                        <h3 className="tit6 t-center p-l-15 p-r-15 p-t-3">
                          Events
                        </h3>
                      </div>

                      <AnimatedLayer
                        className="blo2 flex-w flex-str flex-col-c-m-lg"
                        appear={event.animation}
                        active={active}
                        delay={0}
                      >
                        <Link
                          to={event.link || '#'}
                          className={`wrap-pic-blo2 ${event.bgBloClass || ''}`}
                          style={{
                            backgroundImage: `url(${getImage(event.image)})`,
                          }}
                        >
                          <div className="time-event size10 txt6 effect1">
                            <span className="txt-effect1 flex-c-m t-center">
                              {event.time}
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
                                {event.countdown?.days ?? 0}
                              </span>

                              <span className="dis-block t-center txt8">
                                Days
                              </span>
                            </div>

                            <div className="size11 flex-col-c-m">
                              <span className="dis-block t-center txt7 m-b-2 hours">
                                {event.countdown?.hours ?? 0}
                              </span>

                              <span className="dis-block t-center txt8">
                                Hours
                              </span>
                            </div>

                            <div className="size11 flex-col-c-m">
                              <span className="dis-block t-center txt7 m-b-2 minutes">
                                {event.countdown?.minutes ?? 0}
                              </span>

                              <span className="dis-block t-center txt8">
                                Minutes
                              </span>
                            </div>

                            <div className="size11 flex-col-c-m">
                              <span className="dis-block t-center txt7 m-b-2 seconds">
                                {event.countdown?.seconds ?? 0}
                              </span>

                              <span className="dis-block t-center txt8">
                                Seconds
                              </span>
                            </div>
                          </div>

                          <Link to={event.link || '#'} className="txt4 m-t-40">
                            View Details
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
