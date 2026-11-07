// src/repositories/reviews.repository.js

import { getPool, sql } from '../config/database.js';

export async function listPublished(page, pageSize) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool.request()
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize)
    .query(`
      SELECT r.*, c.full_name, c.phone
      FROM reviews r
      JOIN customers c ON c.id = r.customer_id
      WHERE r.is_published = 1
      ORDER BY r.created_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function countPublished() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT COUNT(1) AS total FROM reviews WHERE is_published = 1');
  return result.recordset[0].total;
}

export async function listAll(page, pageSize) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool.request()
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize)
    .query(`
      SELECT r.*, c.full_name, c.phone
      FROM reviews r
      JOIN customers c ON c.id = r.customer_id
      ORDER BY r.created_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function countAll() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT COUNT(1) AS total FROM reviews');
  return result.recordset[0].total;
}

export async function createReview(customerId, rating, content) {
  const pool = await getPool();
  const result = await pool.request()
    .input('customerId', sql.Int, customerId)
    .input('rating', sql.Int, rating)
    .input('content', sql.NVarChar, content ?? null)
    .query(`
      INSERT INTO reviews (customer_id, rating, content, is_published)
      OUTPUT INSERTED.*
      VALUES (@customerId, @rating, @content, 0)
    `);
  return result.recordset[0];
}

export async function publish(id, isPublished) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('isPublished', sql.Bit, isPublished ? 1 : 0)
    .query(`
      UPDATE reviews SET is_published = @isPublished
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}
