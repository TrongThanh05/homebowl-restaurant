// src/components/common/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { galleryThumbnails } from '../../data/gallery.js';
const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar trans-0-4 ${isOpen ? 'show-sidebar' : ''}`}>
      {/* Nút tắt sidebar */}
      <button
        type="button"
        className="btn-hide-sidebar ti-close color0-hov trans-0-4"
        onClick={onClose}
        aria-label="Close Sidebar"
      />

      {/* Menu liên kết */}
      <ul className="menu-sidebar p-t-95 p-b-70">
        <li className="t-center m-b-13">
          <Link to="/" className="txt19">
            Home
          </Link>
        </li>
        <li className="t-center m-b-13">
          <Link to="/Menu" className="txt19">
            Menu
          </Link>
        </li>
        <li className="t-center m-b-13">
          <Link to="/Gallery" className="txt19">
            Gallery
          </Link>
        </li>
        <li className="t-center m-b-13">
          <Link to="/About" className="txt19">
            About
          </Link>
        </li>
        <li className="t-center m-b-13">
          <Link to="/Blog" className="txt19">
            Blog
          </Link>
        </li>
        <li className="t-center m-b-33">
          <Link to="/Contact" className="txt19">
            Contact
          </Link>
        </li>

        <li className="t-center">
          <Link
            to="/Reservation"
            className="btn3 flex-c-m size13 txt11 trans-0-4 m-l-r-auto"
          >
            Reservation
          </Link>
        </li>
      </ul>

      {/* Mini Gallery */}
      <div className="gallery-sidebar t-center p-l-60 p-r-60 p-b-40">
        <h4 className="txt20 m-b-33">Gallery</h4>

        <div className="wrap-gallery-sidebar flex-w">
          {galleryThumbnails.map((item, index) => (
            <a
              key={index}
              className="item-gallery-sidebar wrap-pic-w"
              href={item.full}
            >
              <img src={item.thumb} alt="GALLERY" />
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
