// src/services/settings.service.js

import * as settingsRepo from '../repositories/settings.repository.js';
import { badRequest, notFound } from '../utils/errors.js';
import { SUPPORTED_LANGS } from '../utils/lang.js';

export async function getAll(lang = 'vi') {
  const rows = await settingsRepo.getAll(lang);
  // Convert to key-value object for convenience
  return rows.reduce((acc, row) => {
    acc[row.setting_key] = row.setting_value;
    return acc;
  }, {});
}

export async function getByKey(key, lang = 'vi') {
  const row = await settingsRepo.getByKey(key, lang);
  if (!row) throw notFound(`Setting '${key}' không tồn tại`);
  return { setting_key: key, setting_value: row.setting_value };
}

export async function upsertSetting(key, body) {
  if (!key) throw badRequest('setting_key là bắt buộc');
  if (body.setting_value === undefined) throw badRequest('setting_value là bắt buộc');
  return settingsRepo.upsert(key, String(body.setting_value));
}

export async function upsertSettingTranslation(key, lang, body) {
  if (!SUPPORTED_LANGS.includes(lang) || lang === 'vi') {
    throw badRequest('Ngôn ngữ không được hỗ trợ hoặc là ngôn ngữ gốc (vi)', 'UNSUPPORTED_LANG');
  }
  const existing = await settingsRepo.getByKey(key);
  if (!existing) throw notFound(`Setting '${key}' không tồn tại`);
  if (body.value === undefined && body.setting_value === undefined) throw badRequest('value là bắt buộc');
  const value = String(body.value ?? body.setting_value);
  return settingsRepo.upsertTranslation(key, lang, value);
}
