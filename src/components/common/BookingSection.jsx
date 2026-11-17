import { useState } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { useLanguage } from '../../i18n/languageContext';
import { getImage } from '../../utils/images';
import {
  timeOptions,
  selectCustomStyles,
  renderCustomDatePickerHeader,
} from '../../utils/reservationConstants';

const BookingSection = () => {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(timeOptions[0]);

  const peopleOpts = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: t(i === 0 ? 'booking.people.one' : 'booking.people.other', { count: i + 1 }),
  }));
  const [selectedGuest, setSelectedGuest] = useState(peopleOpts[0]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `${t('booking.title')}:\n${t('booking.date')}: ${startDate.toLocaleDateString()}\n${t('booking.time')}: ${selectedTime?.value}\n${t('booking.guests')}: ${selectedGuest?.value}\n${t('booking.name')}: ${formData.name}\n${t('booking.phone')}: ${formData.phone}\n${t('booking.email')}: ${formData.email}`
    );
  };

  return (
    <section className="section-booking bg1-pattern p-t-100 p-b-110">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 p-b-30">
            <div className="t-center">
              <span className="tit2 t-center">{t('booking.subtitle')}</span>

              <h3 className="tit3 t-center m-b-35 m-t-2">{t('booking.title')}</h3>
            </div>

            <form className="wrap-form-booking" onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  {/* Date */}
                  <span className="txt9">{t('booking.date')}</span>
                  <div className="wrap-inputdate pos-relative txt10 size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      className="bo-rad-10 sizefull txt10 p-l-20 border-0"
                      dateFormat="dd/MM/yyyy"
                      renderCustomHeader={renderCustomDatePickerHeader}
                    />
                    <i
                      className="btn-calendar fa fa-calendar ab-r-m hov-pointer m-r-18"
                      aria-hidden="true"
                    ></i>
                  </div>

                  {/* Time */}
                  <span className="txt9">{t('booking.time')}</span>
                  <div className="wrap-inputtime size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                    <Select
                      value={selectedTime}
                      onChange={setSelectedTime}
                      options={timeOptions}
                      styles={selectCustomStyles}
                      isSearchable={false}
                    />
                  </div>

                  {/* Guests */}
                  <span className="txt9">{t('booking.guests')}</span>
                  <div className="wrap-inputguest size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                    <Select
                      value={selectedGuest}
                      onChange={setSelectedGuest}
                      options={peopleOpts}
                      styles={selectCustomStyles}
                      isSearchable={false}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  {/* Name */}
                  <span className="txt9">{t('booking.name')}</span>
                  <div className="wrap-inputname size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                    <input
                      className="bo-rad-10 sizefull txt10 p-l-20 border-0"
                      type="text"
                      name="name"
                      placeholder={t('booking.name')}
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <span className="txt9">{t('booking.phone')}</span>
                  <div className="wrap-inputphone size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                    <input
                      className="bo-rad-10 sizefull txt10 p-l-20 border-0"
                      type="tel"
                      name="phone"
                      placeholder={t('booking.phone')}
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <span className="txt9">{t('booking.email')}</span>
                  <div className="wrap-inputemail size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                    <input
                      className="bo-rad-10 sizefull txt10 p-l-20 border-0"
                      type="email"
                      name="email"
                      placeholder={t('booking.email')}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="wrap-btn-booking flex-c-m m-t-6">
                <button
                  type="submit"
                  className="btn3 flex-c-m size13 txt11 trans-0-4"
                >
                  {t('booking.submit')}
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
