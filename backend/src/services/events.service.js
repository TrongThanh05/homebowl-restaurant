// src/services/events.service.js

import * as eventsRepo from '../repositories/events.repository.js';
import { badRequest, notFound } from '../utils/errors.js';

export async function listPublished(query = {}) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(query.pageSize || '10', 10)),
  );
  const lang = query.lang || 'vi';
  const [items, total] = await Promise.all([
    eventsRepo.listPublished(page, pageSize, lang),
    eventsRepo.countPublished(),
  ]);
  return { items, meta: { page, pageSize, total } };
}

export async function listAll(query = {}) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(query.pageSize || '10', 10)),
  );
  const [items, total] = await Promise.all([
    eventsRepo.listAll(page, pageSize),
    eventsRepo.countAll(),
  ]);
  return { items, meta: { page, pageSize, total } };
}

export async function createEvent(body) {
  const { title, event_at, eventAt } = body;
  if (!title) throw badRequest('Thiếu tiêu đề sự kiện (title)');
  if (!event_at && !eventAt) throw badRequest('Thiếu thời gian diễn ra sự kiện (event_at)');
  return eventsRepo.createEvent(body);
}

export async function updateEvent(id, body) {
  const event = await eventsRepo.findById(Number(id));
  if (!event) throw notFound('Không tìm thấy sự kiện');
  return eventsRepo.updateEvent(Number(id), { ...event, ...body });
}

export async function publishEvent(id, body) {
  const { is_published } = body;
  const event = await eventsRepo.publish(Number(id), Boolean(is_published));
  if (!event) throw notFound('Không tìm thấy sự kiện');
  return event;
}

export async function getItemTranslations(eventId) {
  return eventsRepo.getItemTranslations(Number(eventId));
}

export async function upsertItemTranslation(eventId, langCode, body) {
  const { title, description } = body || {};
  if (!title) throw badRequest('Tiêu đề bản dịch là bắt buộc');
  return eventsRepo.upsertItemTranslation(
    Number(eventId),
    langCode,
    title,
    description ?? null,
  );
}
