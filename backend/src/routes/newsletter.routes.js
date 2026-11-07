// src/routes/newsletter.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { subscribe, unsubscribe, listSubscribers } from '../controllers/newsletter.controller.js';

const router = createRouter();

router.post('/newsletter-subscribers', subscribe);
router.delete('/newsletter-subscribers/:email', unsubscribe);
router.get('/newsletter-subscribers', authenticate, requireRole('MANAGER', 'ADMIN'), listSubscribers);

export default router;
