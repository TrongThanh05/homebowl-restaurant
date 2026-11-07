// src/routes/orders.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import {
  listOrders, getOrder, createOrder, updateOrderStatus,
  addOrderItem, updateOrderItemStatus,
} from '../controllers/orders.controller.js';

const router = createRouter();

router.get('/orders', authenticate, requireRole('WAITER', 'CHEF', 'CASHIER', 'MANAGER', 'ADMIN'), listOrders);
router.get('/orders/:id', authenticate, requireRole('WAITER', 'CHEF', 'CASHIER', 'MANAGER', 'ADMIN'), getOrder);
router.post('/orders', authenticate, requireRole('WAITER', 'MANAGER', 'ADMIN'), createOrder);
router.patch('/orders/:id/status', authenticate, requireRole('WAITER', 'CASHIER', 'MANAGER', 'ADMIN'), updateOrderStatus);
router.post('/orders/:id/items', authenticate, requireRole('WAITER', 'MANAGER', 'ADMIN'), addOrderItem);
router.patch('/orders/:id/items/:itemId/status', authenticate, requireRole('CHEF', 'WAITER', 'MANAGER', 'ADMIN'), updateOrderItemStatus);

export default router;
