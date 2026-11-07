// src/services/reports.service.js

import * as reportsRepo from '../repositories/reports.repository.js';
import { badRequest } from '../utils/errors.js';

export async function revenueReport(query) {
  const { from, to } = query;
  if (!from || !to) throw badRequest('Tham số from và to là bắt buộc (định dạng YYYY-MM-DD)');

  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    throw badRequest('Định dạng ngày không hợp lệ. Dùng YYYY-MM-DD');
  }
  if (fromDate > toDate) throw badRequest('from phải nhỏ hơn hoặc bằng to');

  // End of day for toDate
  toDate.setHours(23, 59, 59, 999);

  return reportsRepo.revenueByDay(fromDate, toDate);
}

export async function topItemsReport(query) {
  const { from, to } = query;
  if (!from || !to) throw badRequest('Tham số from và to là bắt buộc (định dạng YYYY-MM-DD)');

  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    throw badRequest('Định dạng ngày không hợp lệ. Dùng YYYY-MM-DD');
  }
  if (fromDate > toDate) throw badRequest('from phải nhỏ hơn hoặc bằng to');

  toDate.setHours(23, 59, 59, 999);

  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  return reportsRepo.topMenuItems(fromDate, toDate, limit);
}
