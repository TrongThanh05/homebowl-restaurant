// src/controllers/payments.controller.js

import * as paymentsService from '../services/payments.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { env } from '../config/env.js';

export async function createPayment(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await paymentsService.createPayment(body);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function listPayments(req, res) {
  try {
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await paymentsService.listPayments(query);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function getOrderTotals(req, res) {
  try {
    const data = await paymentsService.getOrderTotals(req.params.id);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}
