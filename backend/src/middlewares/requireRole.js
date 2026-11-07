// src/middlewares/requireRole.js
// Role-based access control middleware factory

import { forbidden } from '../utils/errors.js';

export function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user || !roles.includes(req.user.roleName)) {
      return next(forbidden('Không đủ quyền thực hiện thao tác này'));
    }
    next();
  };
}
