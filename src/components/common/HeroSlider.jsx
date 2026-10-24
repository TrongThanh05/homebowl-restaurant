// src/components/common/HeroSlider.jsx
import { useState } from 'react';
import SliderLib from 'react-slick';
import { Link } from 'react-router-dom';
import AnimatedLayer from './AnimatedLayer';
import slide01 from '../../assets/images/slide1-01.jpg';
import slide02 from '../../assets/images/master-slides-02.jpg';
import slide03 from '../../assets/images/master-slides-01.jpg';

const Slider = SliderLib.default ?? SliderLib;

const slides = [
  {
    id: 1,
    bg: slide01,
    extraClass: 'item1-slick1',
    caption1: 'Welcome to',
    caption2: 'Pato Place',
    appear1: 'fadeInDown',
    appear2: 'fadeInUp',
    appearBtn: 'zoomIn',
    btnText: 'Look Menu',
    btnLink: '/Menu',
  },
  {
    id: 2,
    bg: slide02,
    extraClass: 'item2-slick1',
    caption1: 'Welcome to',
    caption2: 'Pato Place',
    appear1: 'rollIn',
    appear2: 'lightSpeedIn',
    appearBtn: 'slideInUp',
    btnText: 'Look Menu',
    btnLink: '/Menu',
  },
  {
    id: 3,
    bg: slide03,
    extraClass: 'item3-slick1',
    caption1: 'Welcome to',
    caption2: 'Pato Place',
    appear1: 'rotateInDownLeft',
    appear2: 'rotateInUpRight',
    appearBtn: 'rotateIn',
    btnText: 'Look Menu',
    btnLink: '/Menu',
  },
];

function NextArrow({ onClick }) {
  return (
    <button
      type="button"
      className="arrow-slick1 next-slick1"
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
      className="arrow-slick1 prev-slick1"
      onClick={onClick}
      aria-label="Previous slide"
    >
      <i className="fa fa-angle-left" aria-hidden="true"></i>
    </button>
  );
}

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const settings = {
    fade: true,
    autoplay: true,
    autoplaySpeed: 6000,
    speed: 1000,
    infinite: true,
    arrows: true,
    dots: true,
    dotsClass: 'slick1-dots',
    pauseOnHover: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    appendDots: (dots) => <div className="wrap-slick1-dots">{dots}</div>,
    beforeChange: (_oldIndex, newIndex) => setCurrent(newIndex),
    afterChange: (index) => setCurrent(index),
  };

  return (
    <section className="section-slide">
      <div className="wrap-slick1">
        <Slider {...settings} className="slick1">
          {slides.map((slide, index) => {
            const active = index === current;
            return (
              /* Thẻ div bọc ngoài để react-slick không ghi đè style của item-slick1 */
              <div key={slide.id}>
                <div
                  className={`item-slick1 ${slide.extraClass}`}
                  style={{ backgroundImage: `url(${slide.bg})` }}
                >
                  <div className="wrap-content-slide1 sizefull flex-col-c-m p-l-15 p-r-15 p-t-150 p-b-170">
                    <AnimatedLayer
                      as="span"
                      className="caption1-slide1 txt1 t-center m-b-15"
                      appear={slide.appear1}
                      delay={0}
                      active={active}
                    >
                      {slide.caption1}
                    </AnimatedLayer>

                    <AnimatedLayer
                      as="h2"
                      className="caption2-slide1 tit1 t-center m-b-37"
                      appear={slide.appear2}
                      delay={800}
                      active={active}
                    >
                      {slide.caption2}
                    </AnimatedLayer>

                    <AnimatedLayer
                      className="wrap-btn-slide1"
                      appear={slide.appearBtn}
                      delay={1600}
                      active={active}
                    >
                      <Link
                        to={slide.btnLink}
                        className="btn1 flex-c-m size1 txt3 trans-0-4"
                      >
                        {slide.btnText}
                      </Link>
                    </AnimatedLayer>
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
