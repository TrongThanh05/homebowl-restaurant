// src/repositories/employees.repository.js

import { getPool, sql } from '../config/database.js';

export async function listEmployees(isActive) {
  const pool = await getPool();
  const result = await pool.request()
    .input('isActive', sql.Bit, isActive !== undefined ? (isActive ? 1 : 0) : null)
    .query(`
      SELECT e.*, u.email, r.name AS role_name
      FROM employees e
      JOIN users u ON u.id = e.user_id
      JOIN roles r ON r.id = u.role_id
      WHERE (@isActive IS NULL OR e.is_active = @isActive)
      ORDER BY e.full_name
    `);
  return result.recordset;
}

export async function findEmployeeById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT e.*, u.email, r.name AS role_name
      FROM employees e
      JOIN users u ON u.id = e.user_id
      JOIN roles r ON r.id = u.role_id
      WHERE e.id = @id
    `);
  return result.recordset[0] || null;
}

export async function createEmployee(userData, employeeData) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const userResult = await transaction.request()
      .input('email', sql.NVarChar, userData.email)
      .input('hash', sql.NVarChar, userData.passwordHash)
      .input('roleId', sql.Int, userData.roleId)
      .query(`
        INSERT INTO users (email, password_hash, role_id)
        OUTPUT INSERTED.id, INSERTED.email
        VALUES (@email, @hash, @roleId)
      `);
    const user = userResult.recordset[0];

    const empResult = await transaction.request()
      .input('userId', sql.Int, user.id)
      .input('fullName', sql.NVarChar, employeeData.full_name)
      .input('phone', sql.NVarChar, employeeData.phone ?? null)
      .input('position', sql.NVarChar, employeeData.position ?? null)
      .input('hiredDate', sql.Date, employeeData.hired_date ?? null)
      .query(`
        INSERT INTO employees (user_id, full_name, phone, position, hired_date)
        OUTPUT INSERTED.*
        VALUES (@userId, @fullName, @phone, @position, @hiredDate)
      `);
    const employee = empResult.recordset[0];
    employee.email = user.email;

    await transaction.commit();
    return employee;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

export async function updateEmployee(id, fields) {
  const pool = await getPool();
  const sets = [];
  const req = pool.request().input('id', sql.Int, id);
  if (fields.full_name !== undefined) {
    sets.push('full_name = @fullName');
    req.input('fullName', sql.NVarChar, fields.full_name);
  }
  if (fields.phone !== undefined) {
    sets.push('phone = @phone');
    req.input('phone', sql.NVarChar, fields.phone);
  }
  if (fields.position !== undefined) {
    sets.push('position = @position');
    req.input('position', sql.NVarChar, fields.position);
  }
  if (fields.hired_date !== undefined) {
    sets.push('hired_date = @hiredDate');
    req.input('hiredDate', sql.Date, fields.hired_date);
  }
  if (fields.is_active !== undefined) {
    sets.push('is_active = @isActive');
    req.input('isActive', sql.Bit, fields.is_active ? 1 : 0);
  }
  if (!sets.length) return findEmployeeById(id);
  const result = await req.query(`
    UPDATE employees SET ${sets.join(', ')}
    OUTPUT INSERTED.*
    WHERE id = @id
  `);
  return result.recordset[0] || null;
}

export async function deactivate(id) {
  const pool = await getPool();
  // First get the user_id
  const empResult = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT user_id FROM employees WHERE id = @id');
  const employee = empResult.recordset[0];
  if (!employee) return null;

  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    await transaction.request()
      .input('id', sql.Int, id)
      .query('UPDATE employees SET is_active = 0 WHERE id = @id');
    await transaction.request()
      .input('userId', sql.Int, employee.user_id)
      .query('UPDATE users SET is_active = 0 WHERE id = @userId');
    await transaction.commit();
    return { deactivated: true };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}
