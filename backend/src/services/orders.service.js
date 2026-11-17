// src/services/orders.service.js

import * as ordersRepo from '../repositories/orders.repository.js';
import { findItemById } from '../repositories/menu.repository.js';
import { getPool, sql } from '../config/database.js';
import { badRequest, notFound, conflict, forbidden } from '../utils/errors.js';

const VALID_ORDER_STATUSES = ['OPEN', 'SERVING', 'PAID', 'CANCELLED'];
const VALID_ITEM_STATUSES = ['NEW', 'COOKING', 'READY', 'SERVED', 'CANCELLED'];

async function getEmployeeIdByUserId(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query('SELECT id FROM employees WHERE user_id = @userId AND is_active = 1');
  return result.recordset[0]?.id ?? null;
}

export async function createOrder(body, user) {
  const { table_id, reservation_id, note } = body;
  if (!table_id) throw badRequest('table_id là bắt buộc');

  const existing = await ordersRepo.checkOpenOrderForTable(Number(table_id));
  if (existing) throw conflict('Bàn này đang có order đang mở', 'TABLE_HAS_OPEN_ORDER');

  let employeeId = null;
  if (user) {
    employeeId = await getEmployeeIdByUserId(user.id);
  }

  return ordersRepo.createOrder(Number(table_id), employeeId, reservation_id ?? null, note);
}

export async function listOrders(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '10', 10)));
  const status = query.status || null;
  const tableId = query.tableId ? parseInt(query.tableId, 10) : null;

  if (status && !VALID_ORDER_STATUSES.includes(status)) {
    throw badRequest(`Trạng thái không hợp lệ. Các giá trị hợp lệ: ${VALID_ORDER_STATUSES.join(', ')}`);
  }

  const [items, total] = await Promise.all([
    ordersRepo.listOrders(status, tableId, page, pageSize),
    ordersRepo.countOrders(status, tableId),
  ]);

  return { items, meta: { page, pageSize, total } };
}

export async function getOrderById(id) {
  const order = await ordersRepo.findOrderById(Number(id));
  if (!order) throw notFound('Order không tồn tại');
  return order;
}

export async function addItem(orderId, body) {
  const { menu_item_id, quantity, note } = body;
  if (!menu_item_id) throw badRequest('menu_item_id là bắt buộc');
  if (!quantity || Number(quantity) <= 0) throw badRequest('Số lượng phải lớn hơn 0');

  const order = await ordersRepo.findOrderById(Number(orderId));
  if (!order) throw notFound('Order không tồn tại');
  if (!['OPEN', 'SERVING'].includes(order.status)) {
    throw badRequest('Chỉ có thể thêm món cho order đang OPEN hoặc SERVING');
  }

  const item = await findItemById(Number(menu_item_id));
  if (!item) throw notFound('Món ăn không tồn tại');
  if (!item.is_available) throw badRequest('Món ăn hiện không có sẵn');

  return ordersRepo.addOrderItem(Number(orderId), Number(menu_item_id), Number(quantity), item.price, note);
}

export async function updateStatus(orderId, body, user) {
  const { status } = body;
  if (!status || !VALID_ORDER_STATUSES.includes(status)) {
    throw badRequest(`Trạng thái không hợp lệ. Các giá trị hợp lệ: ${VALID_ORDER_STATUSES.join(', ')}`);
  }

  const order = await ordersRepo.findOrderById(Number(orderId));
  if (!order) throw notFound('Order không tồn tại');

  const current = order.status;

  // Validate transitions
  const allowedTransitions = {
    OPEN: ['SERVING', 'CANCELLED'],
    SERVING: ['PAID', 'CANCELLED'],
    PAID: [],
    CANCELLED: [],
  };

  if (!allowedTransitions[current]?.includes(status)) {
    throw badRequest(`Không thể chuyển từ ${current} sang ${status}`);
  }

  // Only MANAGER/ADMIN can cancel SERVING order
  if (current === 'SERVING' && status === 'CANCELLED') {
    if (!['MANAGER', 'ADMIN'].includes(user.roleName)) {
      throw forbidden('Chỉ MANAGER hoặc ADMIN mới có thể huỷ order đang phục vụ');
    }
  }

  const closedAt = status === 'PAID' || status === 'CANCELLED' ? new Date() : null;
  return ordersRepo.updateOrderStatus(Number(orderId), status, closedAt);
}

export async function updateItemStatus(orderId, itemId, body) {
  const { status } = body;
  if (!status || !VALID_ITEM_STATUSES.includes(status)) {
    throw badRequest(`Trạng thái không hợp lệ. Các giá trị hợp lệ: ${VALID_ITEM_STATUSES.join(', ')}`);
  }
  const order = await ordersRepo.findOrderById(Number(orderId));
  if (!order) throw notFound('Order không tồn tại');

  const updated = await ordersRepo.updateOrderItemStatus(Number(itemId), status);
  if (!updated) throw notFound('Order item không tồn tại');
  return updated;
}
