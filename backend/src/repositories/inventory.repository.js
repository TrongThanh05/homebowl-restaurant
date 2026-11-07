// src/repositories/inventory.repository.js

import { getPool, sql } from '../config/database.js';

// ── SUPPLIERS ────────────────────────────────────────────────

export async function listSuppliers() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT * FROM suppliers ORDER BY name');
  return result.recordset;
}

export async function findSupplierById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM suppliers WHERE id = @id');
  return result.recordset[0] || null;
}

export async function createSupplier(name, phone, email) {
  const pool = await getPool();
  const result = await pool.request()
    .input('name', sql.NVarChar, name)
    .input('phone', sql.NVarChar, phone ?? null)
    .input('email', sql.NVarChar, email ?? null)
    .query(`
      INSERT INTO suppliers (name, phone, email)
      OUTPUT INSERTED.*
      VALUES (@name, @phone, @email)
    `);
  return result.recordset[0];
}

export async function updateSupplier(id, fields) {
  const pool = await getPool();
  const sets = [];
  const req = pool.request().input('id', sql.Int, id);
  if (fields.name !== undefined) {
    sets.push('name = @name');
    req.input('name', sql.NVarChar, fields.name);
  }
  if (fields.phone !== undefined) {
    sets.push('phone = @phone');
    req.input('phone', sql.NVarChar, fields.phone);
  }
  if (fields.email !== undefined) {
    sets.push('email = @email');
    req.input('email', sql.NVarChar, fields.email);
  }
  if (!sets.length) return findSupplierById(id);
  const result = await req.query(`
    UPDATE suppliers SET ${sets.join(', ')}
    OUTPUT INSERTED.*
    WHERE id = @id
  `);
  return result.recordset[0] || null;
}

// ── INGREDIENTS ──────────────────────────────────────────────

export async function listIngredients() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT * FROM vw_ingredient_stock ORDER BY name');
  return result.recordset;
}

export async function findIngredientById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM vw_ingredient_stock WHERE id = @id');
  return result.recordset[0] || null;
}

export async function createIngredient(name, unit, minStock) {
  const pool = await getPool();
  const result = await pool.request()
    .input('name', sql.NVarChar, name)
    .input('unit', sql.NVarChar, unit ?? null)
    .input('minStock', sql.Decimal(10, 2), minStock ?? 0)
    .query(`
      INSERT INTO ingredients (name, unit, min_stock)
      OUTPUT INSERTED.*
      VALUES (@name, @unit, @minStock)
    `);
  return result.recordset[0];
}

export async function updateIngredient(id, fields) {
  const pool = await getPool();
  const sets = [];
  const req = pool.request().input('id', sql.Int, id);
  if (fields.name !== undefined) {
    sets.push('name = @name');
    req.input('name', sql.NVarChar, fields.name);
  }
  if (fields.unit !== undefined) {
    sets.push('unit = @unit');
    req.input('unit', sql.NVarChar, fields.unit);
  }
  if (fields.min_stock !== undefined) {
    sets.push('min_stock = @minStock');
    req.input('minStock', sql.Decimal(10, 2), fields.min_stock);
  }
  if (!sets.length) return findIngredientById(id);
  const result = await req.query(`
    UPDATE ingredients SET ${sets.join(', ')}
    OUTPUT INSERTED.*
    WHERE id = @id
  `);
  return result.recordset[0] || null;
}

export async function getLowStock() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT * FROM vw_ingredient_stock WHERE current_stock < min_stock ORDER BY name');
  return result.recordset;
}

// ── STOCK MOVEMENTS ───────────────────────────────────────────

export async function createMovement(ingredientId, supplierId, type, quantity, unitCost, createdBy) {
  const pool = await getPool();
  const result = await pool.request()
    .input('ingredientId', sql.Int, ingredientId)
    .input('supplierId', sql.Int, supplierId ?? null)
    .input('type', sql.NVarChar, type)
    .input('quantity', sql.Decimal(10, 2), quantity)
    .input('unitCost', sql.Decimal(10, 2), unitCost ?? null)
    .input('createdBy', sql.Int, createdBy ?? null)
    .query(`
      INSERT INTO stock_movements (ingredient_id, supplier_id, type, quantity, unit_cost, created_by)
      OUTPUT INSERTED.*
      VALUES (@ingredientId, @supplierId, @type, @quantity, @unitCost, @createdBy)
    `);
  return result.recordset[0];
}

export async function listMovements(ingredientId, page, pageSize) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool.request()
    .input('ingredientId', sql.Int, ingredientId ?? null)
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize)
    .query(`
      SELECT sm.*, i.name AS ingredient_name, s.name AS supplier_name
      FROM stock_movements sm
      JOIN ingredients i ON i.id = sm.ingredient_id
      LEFT JOIN suppliers s ON s.id = sm.supplier_id
      WHERE (@ingredientId IS NULL OR sm.ingredient_id = @ingredientId)
      ORDER BY sm.created_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function countMovements(ingredientId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('ingredientId', sql.Int, ingredientId ?? null)
    .query(`
      SELECT COUNT(1) AS total FROM stock_movements
      WHERE (@ingredientId IS NULL OR ingredient_id = @ingredientId)
    `);
  return result.recordset[0].total;
}
