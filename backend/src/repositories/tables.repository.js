// src/repositories/tables.repository.js

import { getPool, sql } from '../config/database.js';

export async function listTables(status) {
  const pool = await getPool();
  const result = await pool.request()
    .input('status', sql.NVarChar, status ?? null)
    .query(`
      SELECT * FROM dining_tables
      WHERE (@status IS NULL OR status = @status)
      ORDER BY code
    `);
  return result.recordset;
}

export async function findTableById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM dining_tables WHERE id = @id');
  return result.recordset[0] || null;
}

export async function createTable(code, area, capacity) {
  const pool = await getPool();
  const result = await pool.request()
    .input('code', sql.NVarChar, code)
    .input('area', sql.NVarChar, area ?? null)
    .input('capacity', sql.Int, capacity)
    .query(`
      INSERT INTO dining_tables (code, area, capacity)
      OUTPUT INSERTED.*
      VALUES (@code, @area, @capacity)
    `);
  return result.recordset[0];
}

export async function updateTableStatus(id, status) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('status', sql.NVarChar, status)
    .query(`
      UPDATE dining_tables SET status = @status
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}

export async function updateTable(id, fields) {
  const pool = await getPool();
  const sets = [];
  const req = pool.request().input('id', sql.Int, id);
  if (fields.code !== undefined) {
    sets.push('code = @code');
    req.input('code', sql.NVarChar, fields.code);
  }
  if (fields.area !== undefined) {
    sets.push('area = @area');
    req.input('area', sql.NVarChar, fields.area);
  }
  if (fields.capacity !== undefined) {
    sets.push('capacity = @capacity');
    req.input('capacity', sql.Int, fields.capacity);
  }
  if (!sets.length) return findTableById(id);
  const result = await req.query(`
    UPDATE dining_tables SET ${sets.join(', ')}
    OUTPUT INSERTED.*
    WHERE id = @id
  `);
  return result.recordset[0] || null;
}
