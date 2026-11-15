// src/repositories/menu.repository.js

import { getPool, sql } from '../config/database.js';

// ── CATEGORIES ──────────────────────────────────────────────

export async function listCategories() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT id, name, sort_order FROM menu_categories ORDER BY sort_order');
  return result.recordset;
}

export async function findCategoryById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT id, name, sort_order FROM menu_categories WHERE id = @id');
  return result.recordset[0] || null;
}

export async function createCategory(name, sortOrder) {
  const pool = await getPool();
  const result = await pool.request()
    .input('name', sql.NVarChar, name)
    .input('sortOrder', sql.Int, sortOrder ?? 0)
    .query(`
      INSERT INTO menu_categories (name, sort_order)
      OUTPUT INSERTED.*
      VALUES (@name, @sortOrder)
    `);
  return result.recordset[0];
}

export async function updateCategory(id, fields) {
  const pool = await getPool();
  const sets = [];
  const req = pool.request().input('id', sql.Int, id);
  if (fields.name !== undefined) {
    sets.push('name = @name');
    req.input('name', sql.NVarChar, fields.name);
  }
  if (fields.sort_order !== undefined) {
    sets.push('sort_order = @sortOrder');
    req.input('sortOrder', sql.Int, fields.sort_order);
  }
  if (!sets.length) return findCategoryById(id);
  const result = await req.query(`
    UPDATE menu_categories SET ${sets.join(', ')}
    OUTPUT INSERTED.*
    WHERE id = @id
  `);
  return result.recordset[0] || null;
}

export async function deleteCategory(id) {
  const pool = await getPool();
  // Check if any items use this category
  const check = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT COUNT(1) AS cnt FROM menu_items WHERE category_id = @id');
  if (check.recordset[0].cnt > 0) {
    return { hasItems: true };
  }
  await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM menu_categories WHERE id = @id');
  return { hasItems: false };
}

// ── ITEMS ────────────────────────────────────────────────────

export async function listItems(categoryId, page, pageSize) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool.request()
    .input('categoryId', sql.Int, categoryId ?? null)
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize)
    .query(`
      SELECT mi.id, mi.category_id, mi.name, mi.description, mi.price,
             mi.image_url, mi.is_available, mi.created_at,
             mc.name AS category_name,
             wmi.section,
             COALESCE(wmi.sort_order, 999) AS sort_order
      FROM menu_items mi
      JOIN menu_categories mc ON mc.id = mi.category_id
      LEFT JOIN website_menu_items wmi ON wmi.menu_item_id = mi.id
      WHERE (@categoryId IS NULL OR mi.category_id = @categoryId)
        AND mi.is_available = 1
      ORDER BY COALESCE(wmi.sort_order, 999) ASC, mi.created_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function countItems(categoryId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('categoryId', sql.Int, categoryId ?? null)
    .query(`
      SELECT COUNT(1) AS total
      FROM menu_items mi
      WHERE (@categoryId IS NULL OR mi.category_id = @categoryId)
        AND mi.is_available = 1
    `);
  return result.recordset[0].total;
}

export async function findItemById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT mi.*, mc.name AS category_name, wmi.section
      FROM menu_items mi
      JOIN menu_categories mc ON mc.id = mi.category_id
      LEFT JOIN website_menu_items wmi ON wmi.menu_item_id = mi.id
      WHERE mi.id = @id
    `);
  return result.recordset[0] || null;
}

export async function createItem(categoryId, name, description, price, imageUrl) {
  const pool = await getPool();
  const result = await pool.request()
    .input('categoryId', sql.Int, categoryId)
    .input('name', sql.NVarChar, name)
    .input('description', sql.NVarChar, description ?? null)
    .input('price', sql.Decimal(10, 2), price)
    .input('imageUrl', sql.NVarChar, imageUrl ?? null)
    .query(`
      INSERT INTO menu_items (category_id, name, description, price, image_url)
      OUTPUT INSERTED.*
      VALUES (@categoryId, @name, @description, @price, @imageUrl)
    `);
  return result.recordset[0];
}

export async function updateItem(id, fields) {
  const pool = await getPool();
  const sets = [];
  const req = pool.request().input('id', sql.Int, id);
  if (fields.category_id !== undefined) {
    sets.push('category_id = @categoryId');
    req.input('categoryId', sql.Int, fields.category_id);
  }
  if (fields.name !== undefined) {
    sets.push('name = @name');
    req.input('name', sql.NVarChar, fields.name);
  }
  if (fields.description !== undefined) {
    sets.push('description = @description');
    req.input('description', sql.NVarChar, fields.description);
  }
  if (fields.price !== undefined) {
    sets.push('price = @price');
    req.input('price', sql.Decimal(10, 2), fields.price);
  }
  if (fields.image_url !== undefined) {
    sets.push('image_url = @imageUrl');
    req.input('imageUrl', sql.NVarChar, fields.image_url);
  }
  if (!sets.length) return findItemById(id);
  const result = await req.query(`
    UPDATE menu_items SET ${sets.join(', ')}
    OUTPUT INSERTED.*
    WHERE id = @id
  `);
  return result.recordset[0] || null;
}

export async function setAvailability(id, isAvailable) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('isAvailable', sql.Bit, isAvailable ? 1 : 0)
    .query(`
      UPDATE menu_items SET is_available = @isAvailable
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}
