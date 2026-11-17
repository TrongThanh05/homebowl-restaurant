// src/routes/gallery.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import {
  listVisible, listAll, createImage, updateImage,
  getImageTranslations, upsertImageTranslation,
} from '../controllers/gallery.controller.js';

const router = createRouter();

router.get('/gallery', listVisible);
router.get('/gallery/all', authenticate, requireRole('MANAGER', 'ADMIN'), listAll);
router.get('/gallery/:id/translations', authenticate, requireRole('MANAGER', 'ADMIN'), getImageTranslations);
router.patch('/gallery/:id/translations/:lang', authenticate, requireRole('MANAGER', 'ADMIN'), upsertImageTranslation);
router.post('/gallery', authenticate, requireRole('MANAGER', 'ADMIN'), createImage);
router.patch('/gallery/:id', authenticate, requireRole('MANAGER', 'ADMIN'), updateImage);

export default router;
