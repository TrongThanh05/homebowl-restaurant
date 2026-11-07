// src/controllers/settings.controller.js

import * as settingsService from '../services/settings.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { env } from '../config/env.js';

export async function getAll(req, res) {
  try {
    const data = await settingsService.getAll();
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function getByKey(req, res) {
  try {
    const data = await settingsService.getByKey(req.params.key);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function upsertSetting(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await settingsService.upsertSetting(req.params.key, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}
