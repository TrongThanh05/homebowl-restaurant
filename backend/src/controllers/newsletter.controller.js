// src/controllers/newsletter.controller.js

import * as newsletterService from '../services/newsletter.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { env } from '../config/env.js';

export async function subscribe(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await newsletterService.subscribe(body);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function unsubscribe(req, res) {
  try {
    const data = await newsletterService.unsubscribe(req.params.email);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function listSubscribers(req, res) {
  try {
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await newsletterService.listSubscribers(query);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}
