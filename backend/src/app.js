// src/app.js
// Request pipeline: security, CORS, routing, error handling

import http from 'http';
import { env } from './config/env.js';
import { securityMiddleware } from './middlewares/security.js';
import { createApiRouter } from './routes/index.js';
import { sendError } from './utils/http.js';
import { notFound, HttpError } from './utils/errors.js';

export function createApp() {
  const router = createApiRouter();

  const server = http.createServer(async (req, res) => {
    // 1. Security & CORS middleware
    let preflightHandled = false;
    await new Promise((resolve) => {
      securityMiddleware(req, res, () => resolve());
      if (req.method === 'OPTIONS') {
        preflightHandled = true;
        resolve();
      }
    });

    if (preflightHandled || res.writableEnded) {
      return;
    }

    // 2. Validate Content-Length if present
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > env.MAX_BODY_BYTES) {
      sendError(res, new HttpError(413, 'Request body quá lớn', 'PAYLOAD_TOO_LARGE'));
      return;
    }

    // 3. Dispatch to router
    try {
      const matched = await router.handle(req, res);
      if (!matched && !res.writableEnded) {
        sendError(res, notFound(`Route không tồn tại: ${req.method} ${req.url}`));
      }
    } catch (err) {
      if (!res.writableEnded) {
        sendError(res, err);
      }
    }
  });

  return server;
}

export default createApp;
