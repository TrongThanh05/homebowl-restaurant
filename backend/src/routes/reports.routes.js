// src/routes/reports.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { revenueReport, topItemsReport } from '../controllers/reports.controller.js';

const router = createRouter();

router.get('/reports/revenue', authenticate, requireRole('MANAGER', 'ADMIN'), revenueReport);
router.get('/reports/top-items', authenticate, requireRole('MANAGER', 'ADMIN'), topItemsReport);

export default router;
