// src/repositories/auth.repository.js

import { getPool, sql } from '../config/database.js';

export async function findUserByEmail(email) {
  const pool = await getPool();
  const result = await pool.request()
    .input('email', sql.NVarChar, email)
    .query(`
      SELECT u.id, u.email, u.password_hash, u.role_id, u.is_active,
             r.name AS role_name
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.email = @email
    `);
  return result.recordset[0] || null;
}

export async function createUser(email, passwordHash, roleId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('email', sql.NVarChar, email)
    .input('hash', sql.NVarChar, passwordHash)
    .input('roleId', sql.Int, roleId)
    .query(`
      INSERT INTO users (email, password_hash, role_id)
      OUTPUT INSERTED.id, INSERTED.email, INSERTED.created_at
      VALUES (@email, @hash, @roleId)
    `);
  return result.recordset[0];
}

export async function findRoleByName(name) {
  const pool = await getPool();
  const result = await pool.request()
    .input('name', sql.NVarChar, name)
    .query('SELECT id, name FROM roles WHERE name = @name');
  return result.recordset[0] || null;
}
