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

export const galleryCategories = [
  { label: 'All Photo', filter: '*' },
  { label: 'Interior', filter: 'interior' },
  { label: 'Food', filter: 'food' },
  { label: 'Events', filter: 'events' },
  { label: 'Vip guests', filter: 'guests' },
];

export const galleryItems = [
  {
    id: 1,
    img: 'photo-gallery-13.jpg',
    categories: ['events', 'guests'],
  },
  {
    id: 2,
    img: 'photo-gallery-14.jpg',
    categories: ['food'],
  },
  {
    id: 3,
    img: 'photo-gallery-15.jpg',
    categories: ['events'],
  },
  {
    id: 4,
    img: 'photo-gallery-16.jpg',
    categories: ['food'],
  },
  {
    id: 5,
    img: 'photo-gallery-17.jpg',
    categories: ['food'],
  },
  {
    id: 6,
    img: 'photo-gallery-18.jpg',
    categories: ['interior', 'guests'],
  },
  {
    id: 7,
    img: 'photo-gallery-19.jpg',
    categories: ['interior'],
  },
  {
    id: 8,
    img: 'photo-gallery-20.jpg',
    categories: ['interior'],
  },
  {
    id: 9,
    img: 'photo-gallery-21.jpg',
    categories: ['events'],
  },
];

export { galleryThumbnails };
