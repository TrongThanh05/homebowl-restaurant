// src/controllers/tables.controller.js

import * as tablesService from '../services/tables.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { env } from '../config/env.js';

export async function listTables(req, res) {
  try {
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await tablesService.listTables(query);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function getTable(req, res) {
  try {
    const data = await tablesService.getTableById(req.params.id);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function createTable(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await tablesService.createTable(body);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function updateTable(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await tablesService.updateTable(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function updateTableStatus(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await tablesService.updateTableStatus(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}
