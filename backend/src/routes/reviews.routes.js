// src/routes/reviews.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { listPublished, listAll, createReview, publishReview } from '../controllers/reviews.controller.js';

const router = createRouter();

router.get('/reviews', listPublished);
router.post('/reviews', createReview);
router.get('/reviews/all', authenticate, requireRole('MANAGER', 'ADMIN'), listAll);
router.patch('/reviews/:id/publish', authenticate, requireRole('MANAGER', 'ADMIN'), publishReview);

export default router;
