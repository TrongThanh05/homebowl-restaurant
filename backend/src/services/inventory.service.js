// src/services/inventory.service.js

import * as inventoryRepo from '../repositories/inventory.repository.js';
import { badRequest, notFound } from '../utils/errors.js';

const VALID_MOVEMENT_TYPES = ['IN', 'OUT', 'ADJUST'];

// ── SUPPLIERS ────────────────────────────────────────────────

export async function listSuppliers() {
  return inventoryRepo.listSuppliers();
}

export async function createSupplier(body) {
  const { name, phone, email } = body;
  if (!name || !name.trim()) throw badRequest('Tên nhà cung cấp là bắt buộc');
  return inventoryRepo.createSupplier(name.trim(), phone, email);
}

export async function updateSupplier(id, body) {
  const supplier = await inventoryRepo.findSupplierById(Number(id));
  if (!supplier) throw notFound('Nhà cung cấp không tồn tại');
  return inventoryRepo.updateSupplier(Number(id), body);
}

// ── INGREDIENTS ──────────────────────────────────────────────

export async function listIngredients() {
  return inventoryRepo.listIngredients();
}

export async function getIngredientById(id) {
  const ing = await inventoryRepo.findIngredientById(Number(id));
  if (!ing) throw notFound('Nguyên liệu không tồn tại');
  return ing;
}

export async function getLowStock() {
  return inventoryRepo.getLowStock();
}

export async function createIngredient(body) {
  const { name, unit, min_stock } = body;
  if (!name || !name.trim()) throw badRequest('Tên nguyên liệu là bắt buộc');
  return inventoryRepo.createIngredient(name.trim(), unit, min_stock);
}

export async function updateIngredient(id, body) {
  const ing = await inventoryRepo.findIngredientById(Number(id));
  if (!ing) throw notFound('Nguyên liệu không tồn tại');
  return inventoryRepo.updateIngredient(Number(id), body);
}

// ── STOCK MOVEMENTS ───────────────────────────────────────────

export async function listMovements(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '10', 10)));
  const ingredientId = query.ingredientId ? parseInt(query.ingredientId, 10) : null;

  const [items, total] = await Promise.all([
    inventoryRepo.listMovements(ingredientId, page, pageSize),
    inventoryRepo.countMovements(ingredientId),
  ]);
  return { items, meta: { page, pageSize, total } };
}

export async function createMovement(body, user) {
  const { ingredient_id, supplier_id, type, quantity, unit_cost } = body;
  if (!ingredient_id) throw badRequest('ingredient_id là bắt buộc');
  if (!type || !VALID_MOVEMENT_TYPES.includes(type)) {
    throw badRequest(`Loại phiếu không hợp lệ. Các giá trị hợp lệ: ${VALID_MOVEMENT_TYPES.join(', ')}`);
  }
  if (type !== 'ADJUST' && (!quantity || Number(quantity) <= 0)) {
    throw badRequest('Số lượng phải lớn hơn 0');
  }

  const ing = await inventoryRepo.findIngredientById(Number(ingredient_id));
  if (!ing) throw notFound('Nguyên liệu không tồn tại');

  const createdBy = user?.id ?? null;
  return inventoryRepo.createMovement(
    Number(ingredient_id),
    supplier_id ? Number(supplier_id) : null,
    type,
    Number(quantity),
    unit_cost ? Number(unit_cost) : null,
    createdBy
  );
}
