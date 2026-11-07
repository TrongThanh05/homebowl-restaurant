// src/repositories/reservations.repository.js

import { getPool, sql } from '../config/database.js';

export async function findOrCreateCustomer(fullName, phone, email) {
  const pool = await getPool();
  if (phone) {
    const existing = await pool.request()
      .input('phone', sql.NVarChar, phone)
      .query('SELECT * FROM customers WHERE phone = @phone');
    if (existing.recordset[0]) return existing.recordset[0];
  }
  const result = await pool.request()
    .input('fullName', sql.NVarChar, fullName)
    .input('phone', sql.NVarChar, phone ?? null)
    .input('email', sql.NVarChar, email ?? null)
    .query(`
      INSERT INTO customers (full_name, phone, email)
      OUTPUT INSERTED.*
      VALUES (@fullName, @phone, @email)
    `);
  return result.recordset[0];
}

export async function createReservation(customerId, reservedAt, guests, note) {
  const pool = await getPool();
  const result = await pool.request()
    .input('customerId', sql.Int, customerId)
    .input('reservedAt', sql.DateTime2, reservedAt)
    .input('guests', sql.Int, guests)
    .input('note', sql.NVarChar, note ?? null)
    .query(`
      INSERT INTO reservations (customer_id, reserved_at, guests, note, status)
      OUTPUT INSERTED.*
      VALUES (@customerId, @reservedAt, @guests, @note, 'PENDING')
    `);
  return result.recordset[0];
}

export async function listReservations(status, page, pageSize) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool.request()
    .input('status', sql.NVarChar, status ?? null)
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize)
    .query(`
      SELECT r.*, c.full_name AS customer_name, c.phone AS customer_phone,
             dt.code AS table_code
      FROM reservations r
      JOIN customers c ON c.id = r.customer_id
      LEFT JOIN dining_tables dt ON dt.id = r.table_id
      WHERE (@status IS NULL OR r.status = @status)
      ORDER BY r.reserved_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function countReservations(status) {
  const pool = await getPool();
  const result = await pool.request()
    .input('status', sql.NVarChar, status ?? null)
    .query(`
      SELECT COUNT(1) AS total FROM reservations
      WHERE (@status IS NULL OR status = @status)
    `);
  return result.recordset[0].total;
}

export async function findReservationById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT r.*, c.full_name AS customer_name, c.phone AS customer_phone,
             c.email AS customer_email, dt.code AS table_code
      FROM reservations r
      JOIN customers c ON c.id = r.customer_id
      LEFT JOIN dining_tables dt ON dt.id = r.table_id
      WHERE r.id = @id
    `);
  return result.recordset[0] || null;
}

export async function updateReservation(id, fields) {
  const pool = await getPool();
  const sets = [];
  const req = pool.request().input('id', sql.Int, id);
  if (fields.status !== undefined) {
    sets.push('status = @status');
    req.input('status', sql.NVarChar, fields.status);
  }
  if (fields.table_id !== undefined) {
    sets.push('table_id = @tableId');
    req.input('tableId', sql.Int, fields.table_id);
  }
  if (fields.note !== undefined) {
    sets.push('note = @note');
    req.input('note', sql.NVarChar, fields.note);
  }
  if (fields.reserved_at !== undefined) {
    sets.push('reserved_at = @reservedAt');
    req.input('reservedAt', sql.DateTime2, fields.reserved_at);
  }
  if (fields.guests !== undefined) {
    sets.push('guests = @guests');
    req.input('guests', sql.Int, fields.guests);
  }
  if (!sets.length) return findReservationById(id);
  const result = await req.query(`
    UPDATE reservations SET ${sets.join(', ')}
    OUTPUT INSERTED.*
    WHERE id = @id
  `);
  return result.recordset[0] || null;
}
