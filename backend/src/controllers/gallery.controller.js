// src/controllers/gallery.controller.js

import * as galleryService from '../services/gallery.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { resolveLang } from '../utils/lang.js';
import { env } from '../config/env.js';

export async function listVisible(req, res) {
  try {
    const lang = resolveLang(req);
    const data = await galleryService.listVisible(lang);
    sendSuccess(res, data, 200, {
      'Content-Language': lang,
      'Vary': 'Accept-Language',
    });
  } catch (err) { sendError(res, err); }
}

export async function listAll(req, res) {
  try {
    const data = await galleryService.listAll();
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function createImage(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await galleryService.createImage(body);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function updateImage(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await galleryService.updateImage(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function getImageTranslations(req, res) {
  try {
    const data = await galleryService.getImageTranslations(req.params.id);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function upsertImageTranslation(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await galleryService.upsertImageTranslation(req.params.id, req.params.lang, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}
