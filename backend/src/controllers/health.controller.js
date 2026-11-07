// src/controllers/health.controller.js

import { getHealthStatus } from '../services/health.service.js';
import { sendSuccess, sendError } from '../utils/http.js';

export async function healthCheck(req, res) {
  try {
    const data = await getHealthStatus();
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
}
