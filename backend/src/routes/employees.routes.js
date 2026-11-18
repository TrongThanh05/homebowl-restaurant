// src/routes/employees.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import {
  listEmployees,
  listChefs,
  getEmployee,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
} from '../controllers/employees.controller.js';

const router = createRouter();

router.get('/employees/chefs', listChefs);
router.get('/chefs', listChefs);
router.get('/employees', listEmployees);
router.get('/employees/all', authenticate, requireRole('MANAGER', 'ADMIN'), listEmployees);
router.get('/employees/:id', getEmployee);
router.post('/employees', authenticate, requireRole('ADMIN'), createEmployee);
router.patch('/employees/:id', authenticate, requireRole('MANAGER', 'ADMIN'), updateEmployee);
router.delete('/employees/:id', authenticate, requireRole('ADMIN'), deactivateEmployee);

export default router;
