import { Link } from 'react-router-dom';
import { getImage } from '../../utils/images';

const BlogSection = () => {
  return (
    <section className="section-blog bg-white p-t-115 p-b-123">
      <div className="container">
        <div className="title-section-ourmenu t-center m-b-22">
          <span className="tit2 t-center">Latest News</span>

          <h3 className="tit5 t-center m-t-2">The Blog</h3>
        </div>

        <div className="row">
          <div className="col-md-4 p-t-30">
            <div className="blo1">
              <div className="wrap-pic-blo1 bo-rad-10 hov-img-zoom pos-relative">
                <Link to="/BlogDetail">
                  <img src={getImage('blog-01.jpg')} alt="IMG-INTRO" />
                </Link>

                <div className="time-blog">21 Dec 2017</div>
              </div>

              <div className="wrap-text-blo1 p-t-35">
                <Link to="/BlogDetail">
                  <h4 className="txt5 color0-hov trans-0-4 m-b-13">
                    Best Places for Wine
                  </h4>
                </Link>

                <p className="m-b-20">
                  Phasellus lorem enim, luctus ut velit eget, con-vallis egestas
                  eros.
                </p>

                <Link to="/BlogDetail" className="txt4">
                  Continue Reading
                  <i
                    className="fa fa-long-arrow-right m-l-10"
                    aria-hidden="true"
                  ></i>
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4 p-t-30">
            <div className="blo1">
              <div className="wrap-pic-blo1 bo-rad-10 hov-img-zoom pos-relative">
                <Link to="/BlogDetail">
                  <img src={getImage('blog-02.jpg')} alt="IMG-INTRO" />
                </Link>

                <div className="time-blog">15 Dec 2017</div>
              </div>

              <div className="wrap-text-blo1 p-t-35">
                <Link to="/BlogDetail">
                  <h4 className="txt5 color0-hov trans-0-4 m-b-13">
                    Eggs and Cheese
                  </h4>
                </Link>

                <p className="m-b-20">
                  Duis elementum, risus sit amet lobortis nunc justo condimentum
                  ligula, vitae feugiat
                </p>

                <Link to="/BlogDetail" className="txt4">
                  Continue Reading
                  <i
                    className="fa fa-long-arrow-right m-l-10"
                    aria-hidden="true"
                  ></i>
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4 p-t-30">
            <div className="blo1">
              <div className="wrap-pic-blo1 bo-rad-10 hov-img-zoom pos-relative">
                <Link to="/BlogDetail">
                  <img src={getImage('blog-03.jpg')} alt="IMG-INTRO" />
                </Link>

                <div className="time-blog">12 Dec 2017</div>
              </div>

              <div className="wrap-text-blo1 p-t-35">
                <Link to="/BlogDetail">
                  <h4 className="txt5 color0-hov trans-0-4 m-b-13">
                    Style the Wedding Party
                  </h4>
                </Link>

                <p className="m-b-20">
                  Sed ornare ligula eget tortor tempor, quis porta tellus
                  dictum.
                </p>

                <Link to="/BlogDetail" className="txt4">
                  Continue Reading
                  <i
                    className="fa fa-long-arrow-right m-l-10"
                    aria-hidden="true"
                  ></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default BlogSection;
