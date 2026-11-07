// src/routes/settings.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { getAll, getByKey, upsertSetting } from '../controllers/settings.controller.js';

const router = createRouter();

router.get('/settings', getAll);
router.get('/settings/:key', getByKey);
router.patch('/settings/:key', authenticate, requireRole('ADMIN'), upsertSetting);

export default router;
