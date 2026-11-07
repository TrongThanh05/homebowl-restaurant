// src/routes/menu.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import {
  listCategories, createCategory, updateCategory, deleteCategory,
  listItems, getItem, createItem, updateItem, setAvailability,
} from '../controllers/menu.controller.js';

const router = createRouter();

// Categories
router.get('/menu-categories', listCategories);
router.post('/menu-categories', authenticate, requireRole('MANAGER', 'ADMIN'), createCategory);
router.patch('/menu-categories/:id', authenticate, requireRole('MANAGER', 'ADMIN'), updateCategory);
router.delete('/menu-categories/:id', authenticate, requireRole('ADMIN'), deleteCategory);

// Items
router.get('/menu-items', listItems);
router.get('/menu-items/:id', getItem);
router.post('/menu-items', authenticate, requireRole('MANAGER', 'ADMIN'), createItem);
router.patch('/menu-items/:id', authenticate, requireRole('MANAGER', 'ADMIN'), updateItem);
router.patch('/menu-items/:id/availability', authenticate, requireRole('MANAGER', 'ADMIN'), setAvailability);

export default router;
