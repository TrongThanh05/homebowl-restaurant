// src/routes/reservations.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { createReservation, listReservations, getReservation, updateReservation } from '../controllers/reservations.controller.js';

const router = createRouter();

router.post('/reservations', createReservation);
router.get('/reservations', authenticate, requireRole('WAITER', 'MANAGER', 'ADMIN'), listReservations);
router.get('/reservations/:id', authenticate, requireRole('WAITER', 'MANAGER', 'ADMIN'), getReservation);
router.patch('/reservations/:id', authenticate, requireRole('WAITER', 'MANAGER', 'ADMIN'), updateReservation);

export default router;
