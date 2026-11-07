// src/controllers/reviews.controller.js

import * as reviewsService from '../services/reviews.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { env } from '../config/env.js';

export async function listPublished(req, res) {
  try {
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await reviewsService.listPublished(query);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function listAll(req, res) {
  try {
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await reviewsService.listAll(query);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function createReview(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await reviewsService.createReview(body);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function publishReview(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await reviewsService.publishReview(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}
