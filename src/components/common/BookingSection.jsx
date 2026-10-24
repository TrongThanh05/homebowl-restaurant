import { getImage } from '../../utils/images';

const BookingSection = () => {
  return (
    <section className="section-booking bg1-pattern p-t-100 p-b-110">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 p-b-30">
            <div className="t-center">
              <span className="tit2 t-center">Reservation</span>

              <h3 className="tit3 t-center m-b-35 m-t-2">Book table</h3>
            </div>

            <form className="wrap-form-booking">
              <div className="row">
                <div className="col-md-6">
                  <span className="txt9">Date</span>

                  <div className="wrap-inputdate pos-relative txt10 size12 bo2 bo-rad-10 m-t-3 m-b-23">
                    <input
                      className="my-calendar bo-rad-10 sizefull txt10 p-l-20"
                      type="text"
                      name="date"
                    />
                    <i
                      className="btn-calendar fa fa-calendar ab-r-m hov-pointer m-r-18"
                      aria-hidden="true"
                    ></i>
                  </div>
                  <span className="txt9">Time</span>

                  <div className="wrap-inputtime size12 bo2 bo-rad-10 m-t-3 m-b-23">
                    <select className="selection-1" name="time">
                      <option>9:00</option>
                      <option>9:30</option>
                      <option>10:00</option>
                      <option>10:30</option>
                      <option>11:00</option>
                      <option>11:30</option>
                      <option>12:00</option>
                      <option>12:30</option>
                      <option>13:00</option>
                      <option>13:30</option>
                      <option>14:00</option>
                      <option>14:30</option>
                      <option>15:00</option>
                      <option>15:30</option>
                      <option>16:00</option>
                      <option>16:30</option>
                      <option>17:00</option>
                      <option>17:30</option>
                      <option>18:00</option>
                      <option>18:30</option>
                      <option>19:00</option>
                      <option>19:30</option>
                      <option>20:00</option>
                      <option>20:30</option>
                      <option>21:00</option>
                    </select>
                  </div>
                  <span className="txt9">Guests</span>

                  <div className="wrap-inputguest size12 bo2 bo-rad-10 m-t-3 m-b-23">
                    <select className="selection-2" name="guest">
                      <option>1 Guest</option>
                      <option>2 Guests</option>
                      <option>3 Guests</option>
                      <option>4 Guests</option>
                      <option>5 Guests</option>
                      <option>6 Guests</option>
                      <option>7 Guests</option>
                      <option>8 Guests</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <span className="txt9">Name</span>

                  <div className="wrap-inputname size12 bo2 bo-rad-10 m-t-3 m-b-23">
                    <input
                      className="bo-rad-10 sizefull txt10 p-l-20"
                      type="text"
                      name="name"
                      placeholder="Name"
                    />
                  </div>
                  <span className="txt9">Phone</span>

                  <div className="wrap-inputphone size12 bo2 bo-rad-10 m-t-3 m-b-23">
                    <input
                      className="bo-rad-10 sizefull txt10 p-l-20"
                      type="text"
                      name="phone"
                      placeholder="Phone"
                    />
                  </div>
                  <span className="txt9">Email</span>

                  <div className="wrap-inputemail size12 bo2 bo-rad-10 m-t-3 m-b-23">
                    <input
                      className="bo-rad-10 sizefull txt10 p-l-20"
                      type="text"
                      name="email"
                      placeholder="Email"
                    />
                  </div>
                </div>
              </div>

              <div className="wrap-btn-booking flex-c-m m-t-6">
                <button
                  type="submit"
                  className="btn3 flex-c-m size13 txt11 trans-0-4"
                >
                  Book Table
                </button>
              </div>
            </form>
          </div>

          <div className="col-lg-6 p-b-30 p-t-18">
            <div className="wrap-pic-booking size2 bo-rad-10 hov-img-zoom m-l-r-auto">
              <img src={getImage('booking-01.jpg')} alt="IMG-OUR" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default BookingSection;
