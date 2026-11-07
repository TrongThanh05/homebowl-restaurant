// src/repositories/orders.repository.js

import { getPool, sql } from '../config/database.js';

export async function createOrder(tableId, employeeId, reservationId, note) {
  const pool = await getPool();
  const result = await pool.request()
    .input('tableId', sql.Int, tableId)
    .input('employeeId', sql.Int, employeeId ?? null)
    .input('reservationId', sql.Int, reservationId ?? null)
    .input('note', sql.NVarChar, note ?? null)
    .query(`
      INSERT INTO orders (table_id, employee_id, reservation_id, note, status)
      OUTPUT INSERTED.*
      VALUES (@tableId, @employeeId, @reservationId, @note, 'OPEN')
    `);
  return result.recordset[0];
}

export async function listOrders(status, tableId, page, pageSize) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool.request()
    .input('status', sql.NVarChar, status ?? null)
    .input('tableId', sql.Int, tableId ?? null)
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize)
    .query(`
      SELECT o.*, dt.code AS table_code, e.full_name AS employee_name
      FROM orders o
      LEFT JOIN dining_tables dt ON dt.id = o.table_id
      LEFT JOIN employees e ON e.id = o.employee_id
      WHERE (@status IS NULL OR o.status = @status)
        AND (@tableId IS NULL OR o.table_id = @tableId)
      ORDER BY o.created_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function countOrders(status, tableId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('status', sql.NVarChar, status ?? null)
    .input('tableId', sql.Int, tableId ?? null)
    .query(`
      SELECT COUNT(1) AS total FROM orders
      WHERE (@status IS NULL OR status = @status)
        AND (@tableId IS NULL OR table_id = @tableId)
    `);
  return result.recordset[0].total;
}

export async function findOrderById(id) {
  const pool = await getPool();
  const orderResult = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT o.*, dt.code AS table_code, e.full_name AS employee_name
      FROM orders o
      LEFT JOIN dining_tables dt ON dt.id = o.table_id
      LEFT JOIN employees e ON e.id = o.employee_id
      WHERE o.id = @id
    `);
  const order = orderResult.recordset[0];
  if (!order) return null;

  const itemsResult = await pool.request()
    .input('orderId', sql.Int, id)
    .query(`
      SELECT oi.*, mi.name AS item_name
      FROM order_items oi
      JOIN menu_items mi ON mi.id = oi.menu_item_id
      WHERE oi.order_id = @orderId
    `);
  order.items = itemsResult.recordset;
  return order;
}

export async function updateOrderStatus(id, status, closedAt) {
  const pool = await getPool();
  const req = pool.request()
    .input('id', sql.Int, id)
    .input('status', sql.NVarChar, status);

  if (closedAt) {
    req.input('closedAt', sql.DateTime2, closedAt);
    const result = await req.query(`
      UPDATE orders SET status = @status, closed_at = @closedAt
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
    return result.recordset[0] || null;
  } else {
    const result = await req.query(`
      UPDATE orders SET status = @status
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
    return result.recordset[0] || null;
  }
}

export async function addOrderItem(orderId, menuItemId, quantity, unitPrice, note) {
  const pool = await getPool();
  const result = await pool.request()
    .input('orderId', sql.Int, orderId)
    .input('menuItemId', sql.Int, menuItemId)
    .input('quantity', sql.Int, quantity)
    .input('unitPrice', sql.Decimal(10, 2), unitPrice)
    .input('note', sql.NVarChar, note ?? null)
    .query(`
      INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, note, status)
      OUTPUT INSERTED.*
      VALUES (@orderId, @menuItemId, @quantity, @unitPrice, @note, 'NEW')
    `);
  return result.recordset[0];
}

export async function updateOrderItemStatus(itemId, status) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, itemId)
    .input('status', sql.NVarChar, status)
    .query(`
      UPDATE order_items SET status = @status
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}

export async function cancelOrderItem(itemId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, itemId)
    .query(`
      UPDATE order_items SET status = 'CANCELLED'
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}

export async function getOrderItems(orderId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('orderId', sql.Int, orderId)
    .query(`
      SELECT oi.*, mi.name AS item_name
      FROM order_items oi
      JOIN menu_items mi ON mi.id = oi.menu_item_id
      WHERE oi.order_id = @orderId
    `);
  return result.recordset;
}

export async function checkOpenOrderForTable(tableId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('tableId', sql.Int, tableId)
    .query(`
      SELECT id FROM orders
      WHERE table_id = @tableId AND status IN ('OPEN', 'SERVING')
    `);
  return result.recordset[0] || null;
}
