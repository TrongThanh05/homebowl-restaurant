// src/controllers/auth.controller.js

import { login, register } from '../services/auth.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { env } from '../config/env.js';

export async function loginController(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await login(body.email, body.password);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
}

export async function registerController(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await register(body.email, body.password, body.role);
    sendSuccess(res, data, 201);
  } catch (err) {
    sendError(res, err);
  }
}

export async function me(req, res) {
  try {
    sendSuccess(res, req.user);
  } catch (err) {
    sendError(res, err);
  }
}
