// src/server.js
// Entry point: starts the HTTP server and database pool with graceful shutdown

import { env } from './config/env.js';
import { getPool, closePool } from './config/database.js';
import { createApp } from './app.js';

async function bootstrap() {
  console.log('[Server] Connecting to database...');
  try {
    await getPool();
    console.log('[Server] Database connected successfully.');
  } catch (err) {
    console.error('[Server] Database connection failed:', err.message);
    console.warn('[Server] Starting server anyway; database requests will retry on demand.');
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`[Server] Restaurant API listening on port ${env.PORT} (http://localhost:${env.PORT})`);
  });

  async function shutdown(signal) {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      try {
        await closePool();
        console.log('[Server] Database connection closed.');
      } catch (err) {
        console.error('[Server] Error closing database pool:', err.message);
      }
      process.exit(0);
    });

    setTimeout(() => {
      console.error('[Server] Forceful shutdown after timeout.');
      process.exit(1);
    }, 10000).unref();
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
