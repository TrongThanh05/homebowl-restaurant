// src/routes/inventory.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import {
  listSuppliers, createSupplier, updateSupplier,
  listIngredients, getIngredient, getLowStock, createIngredient, updateIngredient,
  listMovements, createMovement,
} from '../controllers/inventory.controller.js';

const router = createRouter();

// Suppliers
router.get('/suppliers', authenticate, requireRole('MANAGER', 'ADMIN'), listSuppliers);
router.post('/suppliers', authenticate, requireRole('MANAGER', 'ADMIN'), createSupplier);
router.patch('/suppliers/:id', authenticate, requireRole('MANAGER', 'ADMIN'), updateSupplier);

// Ingredients - order matters: /low-stock before /:id
router.get('/ingredients/low-stock', authenticate, requireRole('CHEF', 'MANAGER', 'ADMIN'), getLowStock);
router.get('/ingredients', authenticate, requireRole('CHEF', 'MANAGER', 'ADMIN'), listIngredients);
router.get('/ingredients/:id', authenticate, requireRole('CHEF', 'MANAGER', 'ADMIN'), getIngredient);
router.post('/ingredients', authenticate, requireRole('MANAGER', 'ADMIN'), createIngredient);
router.patch('/ingredients/:id', authenticate, requireRole('MANAGER', 'ADMIN'), updateIngredient);

// Stock movements
router.get('/stock-movements', authenticate, requireRole('CHEF', 'MANAGER', 'ADMIN'), listMovements);
router.post('/stock-movements', authenticate, requireRole('MANAGER', 'ADMIN'), createMovement);

export default router;
