// src/services/health.service.js

import { checkDb } from '../repositories/health.repository.js';

export async function getHealthStatus() {
  const db = await checkDb();
  return { status: db ? 'ok' : 'degraded', db };
}
