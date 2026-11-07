// src/services/auth.service.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { findUserByEmail, createUser, findRoleByName } from '../repositories/auth.repository.js';
import { badRequest, unauthorized, conflict } from '../utils/errors.js';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

export async function login(email, password) {
  if (!email || !password) throw badRequest('Email và mật khẩu là bắt buộc');

  const user = await findUserByEmail(email);
  if (!user) throw unauthorized('Email hoặc mật khẩu không đúng');
  if (!user.is_active) throw unauthorized('Tài khoản đã bị vô hiệu hóa');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw unauthorized('Email hoặc mật khẩu không đúng');

  const token = jwt.sign(
    { id: user.id, email: user.email, roleId: user.role_id, roleName: user.role_name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role_name },
  };
}

export async function register(email, password, roleName = 'CUSTOMER') {
  if (!validateEmail(email)) throw badRequest('Định dạng email không hợp lệ');
  if (!validatePassword(password)) throw badRequest('Mật khẩu phải có ít nhất 6 ký tự');

  const existing = await findUserByEmail(email);
  if (existing) throw conflict('Email đã được sử dụng', 'EMAIL_EXISTS');

  const role = await findRoleByName(roleName);
  if (!role) throw badRequest(`Role không hợp lệ: ${roleName}`);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser(email, passwordHash, role.id);

  return { id: user.id, email: user.email, role: roleName, created_at: user.created_at };
}
