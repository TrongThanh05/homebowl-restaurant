// src/services/settings.service.js

import * as settingsRepo from '../repositories/settings.repository.js';
import { badRequest, notFound } from '../utils/errors.js';

export async function getAll() {
  const rows = await settingsRepo.getAll();
  // Convert to key-value object for convenience
  return rows.reduce((acc, row) => {
    acc[row.setting_key] = row.setting_value;
    return acc;
  }, {});
}

export async function getByKey(key) {
  const row = await settingsRepo.getByKey(key);
  if (!row) throw notFound(`Setting '${key}' không tồn tại`);
  return { setting_key: key, setting_value: row.setting_value };
}

export async function upsertSetting(key, body) {
  if (!key) throw badRequest('setting_key là bắt buộc');
  if (body.setting_value === undefined) throw badRequest('setting_value là bắt buộc');
  return settingsRepo.upsert(key, String(body.setting_value));
}
