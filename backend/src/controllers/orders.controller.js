// src/controllers/orders.controller.js

import * as ordersService from '../services/orders.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { env } from '../config/env.js';

export async function listOrders(req, res) {
  try {
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await ordersService.listOrders(query);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function getOrder(req, res) {
  try {
    const data = await ordersService.getOrderById(req.params.id);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function createOrder(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await ordersService.createOrder(body, req.user);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function updateOrderStatus(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await ordersService.updateStatus(req.params.id, body, req.user);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function addOrderItem(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await ordersService.addItem(req.params.id, body);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function updateOrderItemStatus(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await ordersService.updateItemStatus(req.params.id, req.params.itemId, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}
