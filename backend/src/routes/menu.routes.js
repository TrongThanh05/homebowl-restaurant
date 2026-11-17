// src/routes/menu.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import {
  listCategories, createCategory, updateCategory, deleteCategory,
  listItems, getItem, createItem, updateItem, setAvailability,
  listItemTranslations, upsertItemTranslation, upsertCategoryTranslation,
} from '../controllers/menu.controller.js';

const router = createRouter();

// Categories
router.get('/menu-categories', listCategories);
router.post('/menu-categories', authenticate, requireRole('MANAGER', 'ADMIN'), createCategory);
router.patch('/menu-categories/:id', authenticate, requireRole('MANAGER', 'ADMIN'), updateCategory);
router.delete('/menu-categories/:id', authenticate, requireRole('ADMIN'), deleteCategory);

// Category translations
router.patch('/menu-categories/:id/translations/:lang', authenticate, requireRole('MANAGER', 'ADMIN'), upsertCategoryTranslation);

// Items
router.get('/menu-items', listItems);
router.get('/menu-items/:id', getItem);
router.post('/menu-items', authenticate, requireRole('MANAGER', 'ADMIN'), createItem);
router.patch('/menu-items/:id', authenticate, requireRole('MANAGER', 'ADMIN'), updateItem);
router.patch('/menu-items/:id/availability', authenticate, requireRole('MANAGER', 'ADMIN'), setAvailability);

// Item translations
router.get('/menu-items/:id/translations', authenticate, requireRole('MANAGER', 'ADMIN'), listItemTranslations);
router.patch('/menu-items/:id/translations/:lang', authenticate, requireRole('MANAGER', 'ADMIN'), upsertItemTranslation);

export default router;
