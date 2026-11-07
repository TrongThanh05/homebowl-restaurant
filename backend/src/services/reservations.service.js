// src/services/reservations.service.js

import * as reservationsRepo from '../repositories/reservations.repository.js';
import { badRequest, notFound } from '../utils/errors.js';

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'NO_SHOW', 'COMPLETED'];

export async function createPublic(body) {
  const { full_name, phone, email, reserved_at, guests, note } = body;
  if (!full_name || !full_name.trim()) throw badRequest('Tên khách hàng là bắt buộc');
  if (!reserved_at) throw badRequest('Thời gian đặt bàn là bắt buộc');

  const reservedDate = new Date(reserved_at);
  if (isNaN(reservedDate.getTime())) throw badRequest('Thời gian đặt bàn không hợp lệ');
  if (reservedDate <= new Date()) throw badRequest('Thời gian đặt bàn phải là thời điểm trong tương lai');

  const guestsNum = Number(guests);
  if (!guests || guestsNum <= 0) throw badRequest('Số khách phải lớn hơn 0');

  const customer = await reservationsRepo.findOrCreateCustomer(full_name.trim(), phone, email);
  return reservationsRepo.createReservation(customer.id, reservedDate, guestsNum, note);
}

export async function listReservations(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '10', 10)));
  const status = query.status || null;

  if (status && !VALID_STATUSES.includes(status)) {
    throw badRequest(`Trạng thái không hợp lệ. Các giá trị hợp lệ: ${VALID_STATUSES.join(', ')}`);
  }

  const [items, total] = await Promise.all([
    reservationsRepo.listReservations(status, page, pageSize),
    reservationsRepo.countReservations(status),
  ]);

  return { items, meta: { page, pageSize, total } };
}

export async function getReservationById(id) {
  const r = await reservationsRepo.findReservationById(Number(id));
  if (!r) throw notFound('Đặt bàn không tồn tại');
  return r;
}

export async function updateReservation(id, body) {
  const r = await reservationsRepo.findReservationById(Number(id));
  if (!r) throw notFound('Đặt bàn không tồn tại');
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    throw badRequest(`Trạng thái không hợp lệ. Các giá trị hợp lệ: ${VALID_STATUSES.join(', ')}`);
  }
  return reservationsRepo.updateReservation(Number(id), body);
}
