// src/services/newsletter.service.js

import * as newsletterRepo from '../repositories/newsletter.repository.js';
import { badRequest } from '../utils/errors.js';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function subscribe(body) {
  const { email } = body;
  if (!email || !validateEmail(email)) throw badRequest('Email không hợp lệ');
  return newsletterRepo.subscribe(email.toLowerCase().trim());
}

export async function unsubscribe(email) {
  if (!email || !validateEmail(decodeURIComponent(email))) throw badRequest('Email không hợp lệ');
  const result = await newsletterRepo.unsubscribe(decodeURIComponent(email).toLowerCase().trim());
  return result || { message: 'Email không tồn tại trong danh sách' };
}

export async function listSubscribers(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '10', 10)));
  const [items, total] = await Promise.all([
    newsletterRepo.listSubscribers(page, pageSize),
    newsletterRepo.countSubscribers(),
  ]);
  return { items, meta: { page, pageSize, total } };
}
