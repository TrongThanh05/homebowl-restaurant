// src/services/gallery.service.js

import * as galleryRepo from '../repositories/gallery.repository.js';
import { badRequest, notFound } from '../utils/errors.js';

export async function listVisible() {
  return galleryRepo.listVisible();
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
