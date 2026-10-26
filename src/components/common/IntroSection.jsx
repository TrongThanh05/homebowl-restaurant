import { Link } from 'react-router-dom';
import { getImage } from '../../utils/images';

const IntroSection = () => {
  return (
    <section className="section-intro">
      <div
        className="header-intro parallax100 t-center p-t-135 p-b-158"
        style={{ backgroundImage: `url(${getImage('bg-intro-01.jpg')})` }}
      >
        <span className="tit2 p-l-15 p-r-15">Discover</span>

        <h3 className="tit4 t-center p-l-15 p-r-15 p-t-3">Pato Place</h3>
      </div>

      <div className="content-intro bg-white p-t-77 p-b-133">
        <div className="container">
          <div className="row">
            <div className="col-md-4 p-t-30">
              <div className="blo1">
                <div className="wrap-pic-blo1 bo-rad-10 hov-img-zoom">
                  <a href="#">
                    <img src={getImage('intro-01.jpg')} alt="IMG-INTRO" />{' '}
                  </a>
                </div>

                <div className="wrap-text-blo1 p-t-35">
                  <a href="#">
                    <h4 className="txt5 color0-hov trans-0-4 m-b-13">
                      Romantic Restaurant
                    </h4>
                  </a>

                  <p className="m-b-20">
                    Phasellus lorem enim, luctus ut velit eget, con-vallis
                    egestas eros.
                  </p>

                  <a href="#" className="txt4">
                    Learn More
                    <i
                      className="fa fa-long-arrow-right m-l-10"
                      aria-hidden="true"
                    ></i>
                  </a>
                </div>
              </div>
            </div>

            <div className="col-md-4 p-t-30">
              <div className="blo1">
                <div className="wrap-pic-blo1 bo-rad-10 hov-img-zoom">
                  <a href="#">
                    <img src={getImage('intro-02.jpg')} alt="IMG-INTRO" />
                  </a>
                </div>

                <div className="wrap-text-blo1 p-t-35">
                  <a href="#">
                    <h4 className="txt5 color0-hov trans-0-4 m-b-13">
                      Delicious Food
                    </h4>
                  </a>

                  <p className="m-b-20">
                    Aliquam eget aliquam magna, quis posuere risus ac justo
                    ipsum nibh urna
                  </p>

                  <a href="#" className="txt4">
                    Learn More
                    <i
                      className="fa fa-long-arrow-right m-l-10"
                      aria-hidden="true"
                    ></i>
                  </a>
                </div>
              </div>
            </div>

            <div className="col-md-4 p-t-30">
              <div className="blo1">
                <div className="wrap-pic-blo1 bo-rad-10 hov-img-zoom">
                  <a href="#">
                    <img src={getImage('intro-04.jpg')} alt="IMG-INTRO" />
                  </a>
                </div>

                <div className="wrap-text-blo1 p-t-35">
                  <a href="#">
                    <h4 className="txt5 color0-hov trans-0-4 m-b-13">
                      Red Wines You Love
                    </h4>
                  </a>

                  <p className="m-b-20">
                    Sed ornare ligula eget tortor tempor, quis porta tellus
                    dictum.
                  </p>

                  <a href="#" className="txt4">
                    Learn More
                    <i
                      className="fa fa-long-arrow-right m-l-10"
                      aria-hidden="true"
                    ></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default IntroSection;
