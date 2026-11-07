// src/repositories/settings.repository.js

import { getPool, sql } from '../config/database.js';

export async function getAll() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT setting_key, setting_value FROM site_settings');
  return result.recordset;
}

export async function getByKey(key) {
  const pool = await getPool();
  const result = await pool.request()
    .input('key', sql.NVarChar, key)
    .query('SELECT setting_value FROM site_settings WHERE setting_key = @key');
  return result.recordset[0] || null;
}

export async function upsert(key, value) {
  const pool = await getPool();
  await pool.request()
    .input('key', sql.NVarChar, key)
    .input('value', sql.NVarChar, value)
    .query(`
      MERGE site_settings AS target
      USING (SELECT @key AS setting_key) AS source ON target.setting_key = source.setting_key
      WHEN MATCHED THEN
        UPDATE SET setting_value = @value, updated_at = SYSDATETIME()
      WHEN NOT MATCHED THEN
        INSERT (setting_key, setting_value, updated_at)
        VALUES (@key, @value, SYSDATETIME());
    `);
  return { setting_key: key, setting_value: value };
}
