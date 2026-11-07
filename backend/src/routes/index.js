// src/routes/index.js
// Mounts all route modules under the /api prefix

import { createRouter } from '../utils/router.js';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import menuRoutes from './menu.routes.js';
import tablesRoutes from './tables.routes.js';
import reservationsRoutes from './reservations.routes.js';
import ordersRoutes from './orders.routes.js';
import paymentsRoutes from './payments.routes.js';
import employeesRoutes from './employees.routes.js';
import inventoryRoutes from './inventory.routes.js';
import reviewsRoutes from './reviews.routes.js';
import newsletterRoutes from './newsletter.routes.js';
import blogRoutes from './blog.routes.js';
import galleryRoutes from './gallery.routes.js';
import settingsRoutes from './settings.routes.js';
import reportsRoutes from './reports.routes.js';

export function createApiRouter() {
  const router = createRouter();

  router.use('/api', healthRoutes);
  router.use('/api', authRoutes);
  router.use('/api', menuRoutes);
  router.use('/api', tablesRoutes);
  router.use('/api', reservationsRoutes);
  router.use('/api', ordersRoutes);
  router.use('/api', paymentsRoutes);
  router.use('/api', employeesRoutes);
  router.use('/api', inventoryRoutes);
  router.use('/api', reviewsRoutes);
  router.use('/api', newsletterRoutes);
  router.use('/api', blogRoutes);
  router.use('/api', galleryRoutes);
  router.use('/api', settingsRoutes);
  router.use('/api', reportsRoutes);

  return router;
}

export default createApiRouter;
