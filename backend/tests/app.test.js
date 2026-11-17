// tests/app.test.js
// Tests for core router, HTTP utils, and app dispatching without network sockets

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRouter } from '../src/utils/router.js';
import { createApp } from '../src/app.js';
import { notFound } from '../src/utils/errors.js';
import { sendSuccess, sendError } from '../src/utils/http.js';
import { securityMiddleware } from '../src/middlewares/security.js';

function createMockRes() {
  const headers = {};
  let body = '';
  const res = {
    headers,
    statusCode: 200,
    writableEnded: false,
    setHeader(key, value) {
      headers[key.toLowerCase()] = value;
    },
    writeHead(code, head) {
      res.statusCode = code;
      if (head) {
        for (const [k, v] of Object.entries(head)) {
          headers[k.toLowerCase()] = v;
        }
      }
    },
    write(chunk) {
      body += chunk;
    },
    end(chunk) {
      if (chunk) body += chunk;
      res.writableEnded = true;
    },
    get json() {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    },
    get rawBody() {
      return body;
    },
  };
  return res;
}

test('router matches routes and extracts parameters', async () => {
  const router = createRouter();
  let called = false;
  let paramsCaptured = null;

  router.get('/items/:id', (req, _res) => {
    called = true;
    paramsCaptured = req.params;
  });

  const req = { method: 'GET', url: '/items/123?page=1' };
  const res = createMockRes();

  const matched = await router.handle(req, res);
  assert.equal(matched, true);
  assert.equal(called, true);
  assert.deepEqual(paramsCaptured, { id: '123' });
  assert.equal(req.query.page, '1');
});

test('router matches parameterized translation routes correctly', async () => {
  const router = createRouter();
  let paramsCaptured = null;

  router.patch('/blog-posts/:id/translations/:lang', (req, _res) => {
    paramsCaptured = req.params;
  });

  const req = { method: 'PATCH', url: '/blog-posts/42/translations/en' };
  const res = createMockRes();

  const matched = await router.handle(req, res);
  assert.equal(matched, true);
  assert.deepEqual(paramsCaptured, { id: '42', lang: 'en' });
});

test('router supports mounting subrouters with prefix', async () => {
  const subRouter = createRouter();
  subRouter.get('/hello', (req, res) => {
    res.done = true;
  });

  const mainRouter = createRouter();
  mainRouter.use('/api', subRouter);

  const req = { method: 'GET', url: '/api/hello' };
  const res = createMockRes();

  const matched = await mainRouter.handle(req, res);
  assert.equal(matched, true);
  assert.equal(res.done, true);
});

test('securityMiddleware sets security headers and handles OPTIONS preflight', () => {
  const req = { method: 'OPTIONS', headers: { origin: 'http://localhost:5173' } };
  const res = createMockRes();
  let nextCalled = false;

  securityMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.headers['x-content-type-options'], 'nosniff');
  assert.equal(res.headers['x-frame-options'], 'DENY');
  assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:5173');
  assert.equal(res.statusCode, 204);
  assert.equal(res.writableEnded, true);
  assert.equal(nextCalled, false);
});

test('sendSuccess and sendError format standardized responses', () => {
  const res1 = createMockRes();
  sendSuccess(res1, { id: 1, name: 'Phở' }, 201, {
    'Content-Language': 'en',
    'Vary': 'Accept-Language',
  });
  assert.equal(res1.statusCode, 201);
  assert.equal(res1.json.success, true);
  assert.deepEqual(res1.json.data, { id: 1, name: 'Phở' });
  assert.equal(res1.headers['content-language'], 'en');
  assert.equal(res1.headers['vary'], 'Accept-Language');

  const res2 = createMockRes();
  sendError(res2, notFound('Không tìm thấy bàn'));
  assert.equal(res2.statusCode, 404);
  assert.equal(res2.json.success, false);
  assert.equal(res2.json.error.code, 'NOT_FOUND');
  assert.equal(res2.json.error.message, 'Không tìm thấy bàn');
});

test('app responds with 404 for unknown API route', async () => {
  const app = createApp();
  const req = {
    method: 'GET',
    url: '/api/non-existent-route',
    headers: {},
  };
  const res = createMockRes();

  app.emit('request', req, res);

  // Wait tick for async processing
  await new Promise((r) => setTimeout(r, 20));

  assert.equal(res.statusCode, 404);
  assert.equal(res.json.success, false);
  assert.equal(res.json.error.code, 'NOT_FOUND');
});
