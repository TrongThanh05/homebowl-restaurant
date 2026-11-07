// src/utils/http.js
// HTTP utility functions for sending responses and reading request body

import { HttpError } from './errors.js';

export function sendJson(res, statusCode, body) {
  const json = JSON.stringify(body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(json),
  });
  res.end(json);
}

export function sendSuccess(res, data, statusCode = 200) {
  sendJson(res, statusCode, { success: true, data });
}

export function sendError(res, err) {
  if (err instanceof HttpError) {
    sendJson(res, err.statusCode, {
      success: false,
      error: { code: err.code, message: err.message },
    });
  } else {
    console.error('[Unhandled Error]', err);
    sendJson(res, 500, {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Lỗi hệ thống' },
    });
  }
}

export function readJsonBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalSize = 0;

    req.on('data', (chunk) => {
      totalSize += chunk.length;
      if (totalSize > maxBytes) {
        req.destroy();
        reject(new HttpError(413, 'Request body quá lớn', 'PAYLOAD_TOO_LARGE'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new HttpError(400, 'JSON không hợp lệ', 'INVALID_JSON'));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}
