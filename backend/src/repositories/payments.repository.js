// src/repositories/payments.repository.js

import { getPool, sql } from '../config/database.js';

export async function createPayment(orderId, method, amount, transaction) {
  const req = transaction
    ? transaction.request()
    : (await getPool()).request();

  const result = await req
    .input('orderId', sql.Int, orderId)
    .input('method', sql.NVarChar, method)
    .input('amount', sql.Decimal(10, 2), amount)
    .query(`
      INSERT INTO payments (order_id, method, amount, paid_at)
      OUTPUT INSERTED.*
      VALUES (@orderId, @method, @amount, SYSDATETIME())
    `);
  return result.recordset[0];
}

export async function getOrderTotals(orderId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('orderId', sql.Int, orderId)
    .query('SELECT * FROM vw_order_totals WHERE order_id = @orderId');
  return result.recordset[0] || null;
}

export async function listPayments(page, pageSize) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool.request()
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize)
    .query(`
      SELECT p.*, o.table_id
      FROM payments p
      JOIN orders o ON o.id = p.order_id
      ORDER BY p.paid_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function countPayments() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT COUNT(1) AS total FROM payments');
  return result.recordset[0].total;
}
