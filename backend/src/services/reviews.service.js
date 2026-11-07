// src/services/reviews.service.js

import * as reviewsRepo from '../repositories/reviews.repository.js';
import { getPool, sql } from '../config/database.js';
import { badRequest, notFound } from '../utils/errors.js';

async function findOrCreateCustomer(body) {
  const pool = await getPool();
  if (body.customer_id) {
    const result = await pool.request()
      .input('id', sql.Int, body.customer_id)
      .query('SELECT id FROM customers WHERE id = @id');
    if (!result.recordset[0]) throw badRequest('customer_id không tồn tại');
    return body.customer_id;
  }
  if (body.full_name) {
    const result = await pool.request()
      .input('fullName', sql.NVarChar, body.full_name)
      .input('phone', sql.NVarChar, body.phone ?? null)
      .input('email', sql.NVarChar, body.email ?? null)
      .query(`
        INSERT INTO customers (full_name, phone, email)
        OUTPUT INSERTED.id
        VALUES (@fullName, @phone, @email)
      `);
    return result.recordset[0].id;
  }
  throw badRequest('Cần cung cấp customer_id hoặc full_name');
}

export async function listPublished(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '10', 10)));
  const [items, total] = await Promise.all([
    reviewsRepo.listPublished(page, pageSize),
    reviewsRepo.countPublished(),
  ]);
  return { items, meta: { page, pageSize, total } };
}

export async function listAll(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '10', 10)));
  const [items, total] = await Promise.all([
    reviewsRepo.listAll(page, pageSize),
    reviewsRepo.countAll(),
  ]);
  return { items, meta: { page, pageSize, total } };
}

export async function createReview(body) {
  const { rating, content } = body;
  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    throw badRequest('Điểm đánh giá phải từ 1 đến 5');
  }
  const customerId = await findOrCreateCustomer(body);
  return reviewsRepo.createReview(Number(customerId), Number(rating), content);
}

export async function publishReview(id, body) {
  const { is_published } = body;
  if (is_published === undefined) throw badRequest('Trường is_published là bắt buộc');
  const review = await reviewsRepo.publish(Number(id), Boolean(is_published));
  if (!review) throw notFound('Đánh giá không tồn tại');
  return review;
}
