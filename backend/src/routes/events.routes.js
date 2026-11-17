// src/routes/events.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import {
  listPublished,
  listAll,
  createEvent,
  updateEvent,
  publishEvent,
  getEventTranslations,
  upsertEventTranslation,
} from '../controllers/events.controller.js';

const router = createRouter();

router.get('/events', listPublished);
router.get('/events/all', authenticate, requireRole('MANAGER', 'ADMIN'), listAll);
router.get('/events/:id/translations', authenticate, requireRole('MANAGER', 'ADMIN'), getEventTranslations);
router.patch('/events/:id/translations/:lang', authenticate, requireRole('MANAGER', 'ADMIN'), upsertEventTranslation);
router.post('/events', authenticate, requireRole('MANAGER', 'ADMIN'), createEvent);
router.put('/events/:id', authenticate, requireRole('MANAGER', 'ADMIN'), updateEvent);
router.patch('/events/:id', authenticate, requireRole('MANAGER', 'ADMIN'), updateEvent);
router.patch('/events/:id/publish', authenticate, requireRole('MANAGER', 'ADMIN'), publishEvent);

export default router;
