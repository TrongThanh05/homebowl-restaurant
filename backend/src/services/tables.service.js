// src/services/tables.service.js

import * as tablesRepo from '../repositories/tables.repository.js';
import { badRequest, notFound } from '../utils/errors.js';

const VALID_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'OUT_OF_SERVICE'];

export async function listTables(query) {
  const status = query.status || null;
  if (status && !VALID_STATUSES.includes(status)) {
    throw badRequest(`Trạng thái không hợp lệ. Các giá trị hợp lệ: ${VALID_STATUSES.join(', ')}`);
  }
  return tablesRepo.listTables(status);
}

export async function getTableById(id) {
  const table = await tablesRepo.findTableById(Number(id));
  if (!table) throw notFound('Bàn không tồn tại');
  return table;
}

export async function createTable(body) {
  const { code, area, capacity } = body;
  if (!code || !code.trim()) throw badRequest('Mã bàn là bắt buộc');
  if (!capacity || Number(capacity) <= 0) throw badRequest('Sức chứa phải lớn hơn 0');
  return tablesRepo.createTable(code.trim(), area, Number(capacity));
}

export async function updateTable(id, body) {
  const table = await tablesRepo.findTableById(Number(id));
  if (!table) throw notFound('Bàn không tồn tại');
  if (body.capacity !== undefined && Number(body.capacity) <= 0) {
    throw badRequest('Sức chứa phải lớn hơn 0');
  }
  return tablesRepo.updateTable(Number(id), body);
}

export async function updateTableStatus(id, body) {
  const { status } = body;
  if (!status || !VALID_STATUSES.includes(status)) {
    throw badRequest(`Trạng thái không hợp lệ. Các giá trị hợp lệ: ${VALID_STATUSES.join(', ')}`);
  }
  const table = await tablesRepo.findTableById(Number(id));
  if (!table) throw notFound('Bàn không tồn tại');
  return tablesRepo.updateTableStatus(Number(id), status);
}
