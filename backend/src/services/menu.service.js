// src/services/menu.service.js

import * as menuRepo from '../repositories/menu.repository.js';
import { badRequest, notFound, conflict } from '../utils/errors.js';

// ── CATEGORIES ────────────────────────────────────────────────

export async function listCategories() {
  return menuRepo.listCategories();
}

export async function getCategoryById(id) {
  const cat = await menuRepo.findCategoryById(Number(id));
  if (!cat) throw notFound('Danh mục không tồn tại');
  return cat;
}

export async function createCategory(body) {
  const { name, sort_order } = body;
  if (!name || !name.trim()) throw badRequest('Tên danh mục là bắt buộc');
  return menuRepo.createCategory(name.trim(), sort_order ?? 0);
}

export async function updateCategory(id, body) {
  const cat = await menuRepo.findCategoryById(Number(id));
  if (!cat) throw notFound('Danh mục không tồn tại');
  return menuRepo.updateCategory(Number(id), body);
}

export async function deleteCategory(id) {
  const cat = await menuRepo.findCategoryById(Number(id));
  if (!cat) throw notFound('Danh mục không tồn tại');
  const res = await menuRepo.deleteCategory(Number(id));
  if (res.hasItems) throw conflict('Không thể xóa danh mục đang có món ăn', 'CATEGORY_HAS_ITEMS');
  return { deleted: true };
}

// ── ITEMS ─────────────────────────────────────────────────────

export async function listItems(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '10', 10)));
  const categoryId = query.categoryId ? parseInt(query.categoryId, 10) : null;

  const [items, total] = await Promise.all([
    menuRepo.listItems(categoryId, page, pageSize),
    menuRepo.countItems(categoryId),
  ]);

  return { items, meta: { page, pageSize, total } };
}

export async function getItemById(id) {
  const item = await menuRepo.findItemById(Number(id));
  if (!item) throw notFound('Món ăn không tồn tại');
  return item;
}

export async function createItem(body) {
  const { category_id, name, description, price, image_url } = body;
  if (!name || !name.trim()) throw badRequest('Tên món ăn là bắt buộc');
  if (price === undefined || price === null || Number(price) < 0) throw badRequest('Giá món ăn không hợp lệ');

  const cat = await menuRepo.findCategoryById(Number(category_id));
  if (!cat) throw badRequest('Danh mục không tồn tại');

  return menuRepo.createItem(Number(category_id), name.trim(), description, Number(price), image_url);
}

export async function updateItem(id, body) {
  const item = await menuRepo.findItemById(Number(id));
  if (!item) throw notFound('Món ăn không tồn tại');
  if (body.price !== undefined && Number(body.price) < 0) throw badRequest('Giá món ăn không hợp lệ');
  if (body.name !== undefined && !body.name.trim()) throw badRequest('Tên món ăn không được rỗng');
  if (body.category_id !== undefined) {
    const cat = await menuRepo.findCategoryById(Number(body.category_id));
    if (!cat) throw badRequest('Danh mục không tồn tại');
  }
  return menuRepo.updateItem(Number(id), body);
}

export async function setAvailability(id, body) {
  const item = await menuRepo.findItemById(Number(id));
  if (!item) throw notFound('Món ăn không tồn tại');
  if (body.is_available === undefined) throw badRequest('Trường is_available là bắt buộc');
  return menuRepo.setAvailability(Number(id), Boolean(body.is_available));
}
