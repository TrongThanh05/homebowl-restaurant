// src/routes/tables.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { listTables, getTable, createTable, updateTable, updateTableStatus } from '../controllers/tables.controller.js';

const router = createRouter();

router.get('/tables', authenticate, listTables);
router.get('/tables/:id', authenticate, getTable);
router.post('/tables', authenticate, requireRole('MANAGER', 'ADMIN'), createTable);
router.patch('/tables/:id', authenticate, requireRole('MANAGER', 'ADMIN'), updateTable);
router.patch('/tables/:id/status', authenticate, requireRole('WAITER', 'MANAGER', 'ADMIN'), updateTableStatus);

export default router;
