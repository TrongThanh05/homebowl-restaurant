// src/routes/employees.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { listEmployees, getEmployee, createEmployee, updateEmployee, deactivateEmployee } from '../controllers/employees.controller.js';

const router = createRouter();

router.get('/employees', authenticate, requireRole('MANAGER', 'ADMIN'), listEmployees);
router.get('/employees/:id', authenticate, requireRole('MANAGER', 'ADMIN'), getEmployee);
router.post('/employees', authenticate, requireRole('ADMIN'), createEmployee);
router.patch('/employees/:id', authenticate, requireRole('MANAGER', 'ADMIN'), updateEmployee);
router.delete('/employees/:id', authenticate, requireRole('ADMIN'), deactivateEmployee);

export default router;
