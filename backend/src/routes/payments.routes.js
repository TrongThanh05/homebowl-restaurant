// src/routes/payments.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { createPayment, listPayments, getOrderTotals } from '../controllers/payments.controller.js';

const router = createRouter();

router.post('/payments', authenticate, requireRole('CASHIER', 'MANAGER', 'ADMIN'), createPayment);
router.get('/payments', authenticate, requireRole('CASHIER', 'MANAGER', 'ADMIN'), listPayments);
router.get('/orders/:id/totals', authenticate, requireRole('WAITER', 'CASHIER', 'MANAGER', 'ADMIN'), getOrderTotals);

export default router;
