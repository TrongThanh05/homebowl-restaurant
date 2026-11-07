// src/repositories/health.repository.js

import { getPool } from '../config/database.js';

export async function checkDb() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT 1 AS ok');
  return result.recordset[0].ok === 1;
}
