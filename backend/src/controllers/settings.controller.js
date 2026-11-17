// src/controllers/settings.controller.js

import * as settingsService from '../services/settings.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { resolveLang } from '../utils/lang.js';
import { env } from '../config/env.js';

export async function getAll(req, res) {
  try {
    const lang = resolveLang(req);
    const data = await settingsService.getAll(lang);
    sendSuccess(res, data, 200, {
      'Content-Language': lang,
      'Vary': 'Accept-Language',
    });
  } catch (err) { sendError(res, err); }
}

export async function getByKey(req, res) {
  try {
    const lang = resolveLang(req);
    const data = await settingsService.getByKey(req.params.key, lang);
    sendSuccess(res, data, 200, {
      'Content-Language': lang,
      'Vary': 'Accept-Language',
    });
  } catch (err) { sendError(res, err); }
}

export async function upsertSetting(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await settingsService.upsertSetting(req.params.key, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function upsertSettingTranslation(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await settingsService.upsertSettingTranslation(req.params.key, req.params.lang, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}
