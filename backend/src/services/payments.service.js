// src/services/payments.service.js

import * as paymentsRepo from '../repositories/payments.repository.js';
import { getPool, sql } from '../config/database.js';
import { badRequest, notFound } from '../utils/errors.js';

const VALID_METHODS = ['CASH', 'CARD', 'TRANSFER', 'E_WALLET'];

export async function createPayment(body) {
  const { order_id, method, amount } = body;
  if (!order_id) throw badRequest('order_id là bắt buộc');
  if (!method || !VALID_METHODS.includes(method)) {
    throw badRequest(`Phương thức thanh toán không hợp lệ. Các giá trị hợp lệ: ${VALID_METHODS.join(', ')}`);
  }
  if (!amount || Number(amount) <= 0) throw badRequest('Số tiền phải lớn hơn 0');

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const totals = await paymentsRepo.getOrderTotals(Number(order_id));
    if (!totals) throw notFound('Order không tồn tại hoặc chưa có order');

    const remaining = Number(totals.total_amount) - Number(totals.paid_amount || 0);
    if (Number(amount) > remaining + 0.01) {
      throw badRequest(`Số tiền thanh toán (${amount}) vượt quá số tiền còn lại (${remaining})`);
    }

    const payment = await paymentsRepo.createPayment(Number(order_id), method, Number(amount), transaction);

    // If fully paid, close the order
    const newPaid = Number(totals.paid_amount || 0) + Number(amount);
    if (newPaid >= Number(totals.total_amount) - 0.01) {
      await transaction.request()
        .input('orderId', sql.Int, Number(order_id))
        .query(`
          UPDATE orders SET status = 'PAID', closed_at = SYSDATETIME()
          WHERE id = @orderId
        `);
    }

    await transaction.commit();
    return payment;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

export async function listPayments(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '10', 10)));
  const [items, total] = await Promise.all([
    paymentsRepo.listPayments(page, pageSize),
    paymentsRepo.countPayments(),
  ]);
  return { items, meta: { page, pageSize, total } };
}

export async function getOrderTotals(orderId) {
  const totals = await paymentsRepo.getOrderTotals(Number(orderId));
  if (!totals) throw notFound('Order không tồn tại hoặc chưa có order');
  return totals;
}
