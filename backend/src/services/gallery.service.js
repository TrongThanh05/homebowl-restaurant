// src/services/gallery.service.js

import * as galleryRepo from '../repositories/gallery.repository.js';
import { badRequest, notFound } from '../utils/errors.js';
import { SUPPORTED_LANGS } from '../utils/lang.js';

function validateLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang) || lang === 'vi') {
    throw badRequest('Ngôn ngữ không được hỗ trợ hoặc là ngôn ngữ gốc (vi)', 'UNSUPPORTED_LANG');
  }
}

export async function listVisible(lang = 'vi') {
  return galleryRepo.listVisible(lang);
}

export async function listAll() {
  return galleryRepo.listAll();
}

export async function createImage(body) {
  const { title, thumb_url, image_url, sort_order } = body;
  if (!image_url) throw badRequest('image_url là bắt buộc');
  if (!thumb_url) throw badRequest('thumb_url là bắt buộc');
  return galleryRepo.createImage(title, thumb_url, image_url, sort_order);
}

export async function updateImage(id, body) {
  const image = await galleryRepo.updateImage(Number(id), body);
  if (!image) throw notFound('Ảnh không tồn tại');
  return image;
}

// ── TRANSLATIONS ──────────────────────────────────────────────

export async function getImageTranslations(id) {
  const image = await galleryRepo.findImageById(Number(id));
  if (!image) throw notFound('Ảnh không tồn tại');
  return galleryRepo.getImageTranslations(Number(id));
}

export async function upsertImageTranslation(id, lang, body) {
  validateLang(lang);
  const image = await galleryRepo.findImageById(Number(id));
  if (!image) throw notFound('Ảnh không tồn tại');
  if (!body.title || !body.title.trim()) throw badRequest('Tiêu đề bản dịch là bắt buộc');
  if (body.title.length > 150) throw badRequest('Tiêu đề quá dài (tối đa 150 ký tự)');
  return galleryRepo.upsertImageTranslation(Number(id), lang, body.title.trim());
}
