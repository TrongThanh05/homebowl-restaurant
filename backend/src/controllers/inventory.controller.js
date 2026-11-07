// src/controllers/inventory.controller.js

import * as inventoryService from '../services/inventory.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { env } from '../config/env.js';

// ── SUPPLIERS ────────────────────────────────────────────────

export async function listSuppliers(req, res) {
  try {
    const data = await inventoryService.listSuppliers();
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function createSupplier(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await inventoryService.createSupplier(body);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function updateSupplier(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await inventoryService.updateSupplier(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

// ── INGREDIENTS ──────────────────────────────────────────────

export async function listIngredients(req, res) {
  try {
    const data = await inventoryService.listIngredients();
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function getIngredient(req, res) {
  try {
    const data = await inventoryService.getIngredientById(req.params.id);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function getLowStock(req, res) {
  try {
    const data = await inventoryService.getLowStock();
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function createIngredient(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await inventoryService.createIngredient(body);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function updateIngredient(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await inventoryService.updateIngredient(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

// ── STOCK MOVEMENTS ───────────────────────────────────────────

export async function listMovements(req, res) {
  try {
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await inventoryService.listMovements(query);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function createMovement(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await inventoryService.createMovement(body, req.user);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}
