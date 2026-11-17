// src/controllers/events.controller.js

import * as eventsService from '../services/events.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { env } from '../config/env.js';

export async function listPublished(req, res) {
  try {
    const query = Object.fromEntries(
      new URL('http://x' + req.url).searchParams,
    );
    const data = await eventsService.listPublished(query);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
}

export async function listAll(req, res) {
  try {
    const query = Object.fromEntries(
      new URL('http://x' + req.url).searchParams,
    );
    const data = await eventsService.listAll(query);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
}

export async function createEvent(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await eventsService.createEvent(body);
    sendSuccess(res, data, 201);
  } catch (err) {
    sendError(res, err);
  }
}

export async function updateEvent(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await eventsService.updateEvent(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
}

export async function publishEvent(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await eventsService.publishEvent(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
}

export async function getEventTranslations(req, res) {
  try {
    const data = await eventsService.getItemTranslations(req.params.id);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
}

export async function upsertEventTranslation(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await eventsService.upsertItemTranslation(
      req.params.id,
      req.params.lang,
      body,
    );
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
}
