// src/controllers/gallery.controller.js

import * as galleryService from '../services/gallery.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { env } from '../config/env.js';

export async function listVisible(req, res) {
  try {
    const data = await galleryService.listVisible();
    sendSuccess(res, data);
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
