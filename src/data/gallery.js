// src/data/gallery.js
import { getImage } from '../utils/images';

const galleryThumbnails = [
  { full: getImage('photo-gallery-01.jpg'), thumb: getImage('photo-gallery-thumb-01.jpg') },
  { full: getImage('photo-gallery-02.jpg'), thumb: getImage('photo-gallery-thumb-02.jpg') },
  { full: getImage('photo-gallery-03.jpg'), thumb: getImage('photo-gallery-thumb-03.jpg') },
  { full: getImage('photo-gallery-05.jpg'), thumb: getImage('photo-gallery-thumb-05.jpg') },
  { full: getImage('photo-gallery-06.jpg'), thumb: getImage('photo-gallery-thumb-06.jpg') },
  { full: getImage('photo-gallery-07.jpg'), thumb: getImage('photo-gallery-thumb-07.jpg') },
  { full: getImage('photo-gallery-09.jpg'), thumb: getImage('photo-gallery-thumb-09.jpg') },
  { full: getImage('photo-gallery-10.jpg'), thumb: getImage('photo-gallery-thumb-10.jpg') },
  { full: getImage('photo-gallery-11.jpg'), thumb: getImage('photo-gallery-thumb-11.jpg') },
];

export { galleryThumbnails };
