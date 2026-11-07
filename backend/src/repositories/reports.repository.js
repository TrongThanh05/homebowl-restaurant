// src/repositories/reports.repository.js

import { getPool, sql } from '../config/database.js';

export async function revenueByDay(fromDate, toDate) {
  const pool = await getPool();
  const result = await pool.request()
    .input('from', sql.DateTime2, fromDate)
    .input('to', sql.DateTime2, toDate)
    .query(`
      SELECT
        CAST(p.paid_at AS DATE) AS date,
        SUM(p.amount) AS revenue,
        COUNT(DISTINCT p.order_id) AS order_count
      FROM payments p
      WHERE p.paid_at BETWEEN @from AND @to
      GROUP BY CAST(p.paid_at AS DATE)
      ORDER BY date
    `);
  return result.recordset;
}

export async function topMenuItems(fromDate, toDate, limit) {
  const pool = await getPool();
  const result = await pool.request()
    .input('from', sql.DateTime2, fromDate)
    .input('to', sql.DateTime2, toDate)
    .input('limit', sql.Int, limit)
    .query(`
      SELECT TOP(@limit)
        mi.name,
        SUM(oi.quantity) AS total_qty,
        SUM(oi.quantity * oi.unit_price) AS total_revenue
      FROM order_items oi
      JOIN menu_items mi ON mi.id = oi.menu_item_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status = 'PAID'
        AND o.closed_at BETWEEN @from AND @to
        AND oi.status <> 'CANCELLED'
      GROUP BY mi.id, mi.name
      ORDER BY total_revenue DESC
    `);
  return result.recordset;
}
