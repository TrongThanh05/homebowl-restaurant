// src/repositories/settings.repository.js

import { getPool, sql } from '../config/database.js';

export async function getAll(lang = 'vi') {
  const pool = await getPool();
  const result = await pool.request()
    .input('lang', sql.VarChar(5), lang)
    .query(`
      SELECT s.setting_key,
             COALESCE(NULLIF(t.setting_value, N''), s.setting_value) AS setting_value
      FROM site_settings s
      LEFT JOIN site_setting_translations t ON t.setting_key = s.setting_key AND t.lang_code = @lang
    `);
  return result.recordset;
}

export async function getByKey(key, lang = 'vi') {
  const pool = await getPool();
  const result = await pool.request()
    .input('key', sql.NVarChar, key)
    .input('lang', sql.VarChar(5), lang)
    .query(`
      SELECT COALESCE(NULLIF(t.setting_value, N''), s.setting_value) AS setting_value
      FROM site_settings s
      LEFT JOIN site_setting_translations t ON t.setting_key = s.setting_key AND t.lang_code = @lang
      WHERE s.setting_key = @key
    `);
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

export async function upsertTranslation(key, langCode, value) {
  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();
  try {
    const upd = await new sql.Request(tx)
      .input('key', sql.VarChar(100), key)
      .input('lang', sql.VarChar(5), langCode)
      .input('value', sql.NVarChar(2000), value)
      .query(`UPDATE site_setting_translations WITH (UPDLOCK, HOLDLOCK)
              SET setting_value = @value, updated_at = SYSDATETIME()
              WHERE setting_key = @key AND lang_code = @lang`);
    if (upd.rowsAffected[0] === 0) {
      await new sql.Request(tx)
        .input('key', sql.VarChar(100), key)
        .input('lang', sql.VarChar(5), langCode)
        .input('value', sql.NVarChar(2000), value)
        .query(`INSERT INTO site_setting_translations (setting_key, lang_code, setting_value)
                VALUES (@key, @lang, @value)`);
    }
    await tx.commit();
    return { setting_key: key, lang_code: langCode, setting_value: value };
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}
