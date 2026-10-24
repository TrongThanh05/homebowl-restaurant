// src/utils/images.js
const modules = import.meta.glob(
  '../assets/images/**/*.{png,jpg,jpeg,webp,svg}',
  {
    eager: true,
    import: 'default',
  },
);

// Tạo bản đồ: 'avatar-01.jpg' -> URL đã được Vite xử lý hash
const imageMap = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [
    path.replace(/^.*\/assets\/images\//, ''),
    url,
  ]),
);

export const getImage = (name) => imageMap[name] ?? '';
