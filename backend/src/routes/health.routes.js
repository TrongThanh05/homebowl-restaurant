// src/routes/health.routes.js

import { createRouter } from '../utils/router.js';
import { healthCheck } from '../controllers/health.controller.js';

const router = createRouter();
router.get('/health', healthCheck);

export default router;
