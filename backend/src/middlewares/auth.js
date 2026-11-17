// src/middlewares/auth.js
// JWT authentication middleware

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from '../utils/errors.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) {
    return next(unauthorized('Chưa đăng nhập hoặc thiếu token'));
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      id: payload.id,
      email: payload.email,
      roleId: payload.roleId,
      roleName: payload.roleName,
    };
    next();
  } catch {
    next(unauthorized('Token không hợp lệ hoặc đã hết hạn'));
  }
}
