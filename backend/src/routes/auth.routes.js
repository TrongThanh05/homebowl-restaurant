// src/routes/auth.routes.js

import { createRouter } from '../utils/router.js';
import { loginController, registerController, me } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = createRouter();

router.post('/auth/login', loginController);
router.post('/auth/register', registerController);
router.get('/auth/me', authenticate, me);

export default router;
