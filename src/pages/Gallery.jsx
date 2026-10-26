// src/pages/Gallery.jsx
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import { getImage } from '../utils/images';
import { galleryCategories, galleryItems } from '../data/gallery';
import SignUpSection from '../components/common/SignUpSection';

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState('*');
  const [activePage, setActivePage] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const filteredItems = galleryItems.filter((item) => {
    if (activeFilter === '*') return true;
    return item.categories.includes(activeFilter);
  });

  const lightboxSlides = filteredItems.map((item) => ({
    src: getImage(item.img),
  }));

  return (
    <>
      {/* Title Page */}
      <section
        className="bg-title-page flex-c-m p-t-160 p-b-80 p-l-15 p-r-15"
        style={{ backgroundImage: `url(${getImage('bg-title-page-02.jpg')})` }}
      >
        <h2 className="tit6 t-center">Gallery</h2>
      </section>

      {/* Gallery Section */}
      <div className="section-gallery p-t-118 p-b-100">
        {/* Category Filters */}
        <div className="wrap-label-gallery filter-tope-group size27 flex-w flex-sb-m m-l-r-auto flex-col-c-sm p-l-15 p-r-15 m-b-60">
          {galleryCategories.map((cat, idx) => (
            <button
              key={idx}
              type="button"
              className={`label-gallery txt26 trans-0-4 border-0 ${
                activeFilter === cat.filter ? 'is-actived' : ''
              }`}
              onClick={() => setActiveFilter(cat.filter)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="wrap-gallery isotope-grid flex-w p-l-25 p-r-25">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`item-gallery isotope-item bo-rad-10 hov-img-zoom ${item.categories.join(
                ' '
              )}`}
            >
              <img src={getImage(item.img)} alt="IMG-GALLERY" />

              <div className="overlay-item-gallery trans-0-4 flex-c-m">
                <button
                  type="button"
                  className="btn-show-gallery flex-c-m fa fa-search border-0"
                  onClick={() => setLightboxIndex(index)}
                  aria-label="View photo"
                ></button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination flex-c-m flex-w p-l-15 p-r-15 m-t-24 m-b-50">
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              type="button"
              className={`item-pagination flex-c-m trans-0-4 border-0 ${
                activePage === page ? 'active-pagination' : ''
              }`}
              onClick={() => setActivePage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      </div>

      {/* Sign up */}
      <SignUpSection />

      {/* Lightbox Modal */}
      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={lightboxSlides}
      />
    </>
  );
}
