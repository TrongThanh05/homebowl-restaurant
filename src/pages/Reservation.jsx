// src/pages/Reservation.jsx
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { getImage } from '../utils/images';

const timeOptions = [
  '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
].map((time) => ({ value: time, label: time }));

const peopleOptions = [
  '1 person', '2 people', '3 people', '4 people',
  '5 people', '6 people', '7 people', '8 people',
  '9 people', '10 people', '11 people', '12 people',
].map((people) => ({ value: people, label: people }));

const selectCustomStyles = {
  control: (provided) => ({
    ...provided,
    height: '100%',
    minHeight: '46px',
    border: 'none',
    boxShadow: 'none',
    borderRadius: '10px',
    backgroundColor: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    paddingLeft: '6px',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#666',
    paddingRight: '15px',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '10px',
    zIndex: 99,
  }),
};

export default function Reservation() {
  const [startDate, setStartDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(timeOptions[0]);
  const [selectedPeople, setSelectedPeople] = useState(peopleOptions[0]);
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
      `Booking Details:\nDate: ${startDate.toLocaleDateString()}\nTime: ${selectedTime?.value}\nGuests: ${selectedPeople?.value}\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}`
    );
  };

  return (
    <>
      {/* Title Page */}
      <section
        className="bg-title-page flex-c-m p-t-160 p-b-80 p-l-15 p-r-15"
        style={{ backgroundImage: `url(${getImage('bg-title-page-02.jpg')})` }}
      >
        <h2 className="tit6 t-center">Reservation</h2>
      </section>

      {/* Reservation Section */}
      <section className="section-reservation bg1-pattern p-t-100 p-b-113">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 p-b-30">
              <div className="t-center">
                <span className="tit2 t-center">Reservation</span>

                <h3 className="tit3 t-center m-b-35 m-t-2">Book table</h3>
              </div>

              <form
                className="wrap-form-reservation size22 m-l-r-auto"
                onSubmit={handleSubmit}
              >
                <div className="row">
                  <div className="col-md-4">
                    {/* Date */}
                    <span className="txt9">Date</span>

                    <div className="wrap-inputdate pos-relative txt10 size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        className="bo-rad-10 sizefull txt10 p-l-20 border-0"
                        dateFormat="dd/MM/yyyy"
                      />
                      <i
                        className="btn-calendar fa fa-calendar ab-r-m hov-pointer m-r-18"
                        aria-hidden="true"
                      ></i>
                    </div>
                  </div>

                  <div className="col-md-4">
                    {/* Time */}
                    <span className="txt9">Time</span>

                    <div className="wrap-inputtime size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                      <Select
                        value={selectedTime}
                        onChange={setSelectedTime}
                        options={timeOptions}
                        styles={selectCustomStyles}
                        isSearchable={false}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    {/* People */}
                    <span className="txt9">People</span>

                    <div className="wrap-inputpeople size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                      <Select
                        value={selectedPeople}
                        onChange={setSelectedPeople}
                        options={peopleOptions}
                        styles={selectCustomStyles}
                        isSearchable={false}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    {/* Name */}
                    <span className="txt9">Name</span>

                    <div className="wrap-inputname size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                      <input
                        className="bo-rad-10 sizefull txt10 p-l-20 border-0"
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    {/* Phone */}
                    <span className="txt9">Phone</span>

                    <div className="wrap-inputphone size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                      <input
                        className="bo-rad-10 sizefull txt10 p-l-20 border-0"
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    {/* Email */}
                    <span className="txt9">Email</span>

                    <div className="wrap-inputemail size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                      <input
                        className="bo-rad-10 sizefull txt10 p-l-20 border-0"
                        type="email"
                        name="email"
                        placeholder="Email"
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
                    Book Table
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="info-reservation flex-w p-t-80">
            <div className="size23 w-full-md p-t-40 p-r-30 p-r-0-md">
              <h4 className="txt5 m-b-18">Reserve by Phone</h4>

              <p className="size25">
                Donec quis euismod purus. Donec feugiat ligula rhoncus, varius nisl sed, tincidunt lectus.{' '}
                <span className="txt25">Nulla vulputate</span>, lectus vel volutpat efficitur, orci{' '}
                <span className="txt25">lacus sodales</span> sem, sit amet quam:{' '}
                <span className="txt24">(001) 345 6889</span>
              </p>
            </div>

            <div className="size24 w-full-md p-t-40">
              <h4 className="txt5 m-b-18">For Event Booking</h4>

              <p className="size26">
                Donec feugiat ligula rhoncus:{' '}
                <span className="txt24">(001) 345 6889</span>, varius nisl sed, tinci-dunt lectus sodales sem.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
