// src/controllers/menu.controller.js

import * as menuService from '../services/menu.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { resolveLang } from '../utils/lang.js';
import { env } from '../config/env.js';

// ── CATEGORIES ────────────────────────────────────────────────

export async function listCategories(req, res) {
  try {
    const lang = resolveLang(req);
    const data = await menuService.listCategories(lang);
    sendSuccess(res, data, 200, {
      'Content-Language': lang,
      'Vary': 'Accept-Language',
    });
  } catch (err) { sendError(res, err); }
}

export async function createCategory(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await menuService.createCategory(body);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function updateCategory(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await menuService.updateCategory(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function deleteCategory(req, res) {
  try {
    const data = await menuService.deleteCategory(req.params.id);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

// ── ITEMS ─────────────────────────────────────────────────────

export async function listItems(req, res) {
  try {
    const lang = resolveLang(req);
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await menuService.listItems(query, lang);
    sendSuccess(res, data, 200, {
      'Content-Language': lang,
      'Vary': 'Accept-Language',
    });
  } catch (err) { sendError(res, err); }
}

export async function getItem(req, res) {
  try {
    const lang = resolveLang(req);
    const data = await menuService.getItemById(req.params.id, lang);
    sendSuccess(res, data, 200, {
      'Content-Language': lang,
      'Vary': 'Accept-Language',
    });
  } catch (err) { sendError(res, err); }
}

export async function createItem(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await menuService.createItem(body);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function updateItem(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await menuService.updateItem(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function setAvailability(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await menuService.setAvailability(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

// ── TRANSLATIONS ──────────────────────────────────────────────

export async function listItemTranslations(req, res) {
  try {
    const data = await menuService.getItemTranslations(req.params.id);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function upsertItemTranslation(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await menuService.upsertItemTranslation(req.params.id, req.params.lang, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function upsertCategoryTranslation(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await menuService.upsertCategoryTranslation(req.params.id, req.params.lang, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}
