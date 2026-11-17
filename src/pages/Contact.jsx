// src/pages/Contact.jsx
import { useState } from 'react';
import { getImage } from '../utils/images';
import { useLanguage } from '../i18n/languageContext';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(t('contact.successMsg', { name: formData.name }));
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <>
      {/* Title Page */}
      <section
        className="bg-title-page flex-c-m p-t-160 p-b-80 p-l-15 p-r-15"
        style={{ backgroundImage: `url(${getImage('bg-title-page-02.jpg')})` }}
      >
        <h2 className="tit6 t-center">{t('contact.pageTitle')}</h2>
      </section>

      {/* Contact Section */}
      <section className="section-contact bg1-pattern p-t-90 p-b-113">
        {/* Map */}
        <div className="container">
          <div className="map bo8 bo-rad-10 of-hidden">
            <div className="contact-map size37" id="google_map">
              <iframe
                title={t('contact.mapTitle')}
                src="https://maps.google.com/maps?q=40.704644,-74.011987&hl=en&z=14&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '485px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        <div className="container">
          <h3 className="tit7 t-center p-b-62 p-t-105">{t('contact.formTitle')}</h3>

          <form
            className="wrap-form-reservation size22 m-l-r-auto"
            onSubmit={handleSubmit}
          >
            <div className="row">
              <div className="col-md-4">
                {/* Name */}
                <span className="txt9">{t('contact.name')}</span>

                <div className="wrap-inputname size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                  <input
                    className="bo-rad-10 sizefull txt10 p-l-20 border-0"
                    type="text"
                    name="name"
                    placeholder={t('contact.name')}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-md-4">
                {/* Email */}
                <span className="txt9">{t('contact.email')}</span>

                <div className="wrap-inputemail size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                  <input
                    className="bo-rad-10 sizefull txt10 p-l-20 border-0"
                    type="email"
                    name="email"
                    placeholder={t('contact.email')}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-md-4">
                {/* Phone */}
                <span className="txt9">{t('contact.phone')}</span>

                <div className="wrap-inputphone size12 bo2 bo-rad-10 m-t-3 m-b-23 bgwhite">
                  <input
                    className="bo-rad-10 sizefull txt10 p-l-20 border-0"
                    type="tel"
                    name="phone"
                    placeholder={t('contact.phone')}
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-12">
                {/* Message */}
                <span className="txt9">{t('contact.message')}</span>
                <textarea
                  className="bo-rad-10 size35 bo2 txt10 p-l-20 p-t-15 m-b-10 m-t-3 bgwhite"
                  name="message"
                  placeholder={t('contact.message')}
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
            </div>

            <div className="wrap-btn-booking flex-c-m m-t-13">
              <button
                type="submit"
                className="btn3 flex-c-m size36 txt11 trans-0-4"
              >
                {t('contact.submit')}
              </button>
            </div>
          </form>

          <div className="row p-t-135">
            <div className="col-sm-8 col-md-4 col-lg-4 m-l-r-auto p-t-30">
              <div className="dis-flex m-l-23">
                <div className="p-r-40 p-t-6">
                  <img
                    src={getImage('icons/map-icon.png') || getImage('map-icon.png')}
                    alt="IMG-ICON"
                  />
                </div>

                <div className="flex-col-l">
                  <span className="txt5 p-b-10">{t('contact.location')}</span>

                  <span className="txt23 size38">
                    8th floor, 379 Hudson St, New York, NY 10018
                  </span>
                </div>
              </div>
            </div>

            <div className="col-sm-8 col-md-3 col-lg-4 m-l-r-auto p-t-30">
              <div className="dis-flex m-l-23">
                <div className="p-r-40 p-t-6">
                  <img
                    src={getImage('icons/phone-icon.png') || getImage('phone-icon.png')}
                    alt="IMG-ICON"
                  />
                </div>

                <div className="flex-col-l">
                  <span className="txt5 p-b-10">{t('contact.callUs')}</span>

                  <span className="txt23 size38">(+1) 96 716 6879</span>
                </div>
              </div>
            </div>

            <div className="col-sm-8 col-md-5 col-lg-4 m-l-r-auto p-t-30">
              <div className="dis-flex m-l-23">
                <div className="p-r-40 p-t-6">
                  <img
                    src={getImage('icons/clock-icon.png') || getImage('clock-icon.png')}
                    alt="IMG-ICON"
                  />
                </div>

                <div className="flex-col-l">
                  <span className="txt5 p-b-10">{t('contact.openingHours')}</span>

                  <span className="txt23 size38">
                    09:30 AM – 11:00 PM <br />
                    {t('common.everyDay')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
