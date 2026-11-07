// src/services/employees.service.js

import bcrypt from 'bcryptjs';
import * as employeesRepo from '../repositories/employees.repository.js';
import { findRoleByName, findUserByEmail } from '../repositories/auth.repository.js';
import { badRequest, notFound, conflict } from '../utils/errors.js';

export async function listEmployees(query) {
  const isActive = query.isActive !== undefined
    ? (query.isActive === 'true' || query.isActive === '1')
    : undefined;
  return employeesRepo.listEmployees(isActive);
}

export async function getEmployeeById(id) {
  const emp = await employeesRepo.findEmployeeById(Number(id));
  if (!emp) throw notFound('Nhân viên không tồn tại');
  return emp;
}

export async function createEmployee(body) {
  const { email, password, role, full_name, phone, position, hired_date } = body;
  if (!email || !full_name) throw badRequest('Email và tên nhân viên là bắt buộc');
  if (!password || password.length < 6) throw badRequest('Mật khẩu phải có ít nhất 6 ký tự');

  const existing = await findUserByEmail(email);
  if (existing) throw conflict('Email đã được sử dụng', 'EMAIL_EXISTS');

  const roleName = role || 'WAITER';
  const roleObj = await findRoleByName(roleName);
  if (!roleObj) throw badRequest(`Role không hợp lệ: ${roleName}`);

  const passwordHash = await bcrypt.hash(password, 10);
  return employeesRepo.createEmployee(
    { email, passwordHash, roleId: roleObj.id },
    { full_name, phone, position, hired_date }
  );
}

export async function updateEmployee(id, body) {
  const emp = await employeesRepo.findEmployeeById(Number(id));
  if (!emp) throw notFound('Nhân viên không tồn tại');
  return employeesRepo.updateEmployee(Number(id), body);
}

export async function deactivateEmployee(id) {
  const emp = await employeesRepo.findEmployeeById(Number(id));
  if (!emp) throw notFound('Nhân viên không tồn tại');
  return employeesRepo.deactivate(Number(id));
}
