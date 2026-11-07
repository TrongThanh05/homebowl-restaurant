// src/controllers/reservations.controller.js

import * as reservationsService from '../services/reservations.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { env } from '../config/env.js';

export async function createReservation(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await reservationsService.createPublic(body);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function listReservations(req, res) {
  try {
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await reservationsService.listReservations(query);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function getReservation(req, res) {
  try {
    const data = await reservationsService.getReservationById(req.params.id);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function updateReservation(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await reservationsService.updateReservation(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}
