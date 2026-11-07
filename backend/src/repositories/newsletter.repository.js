// src/repositories/newsletter.repository.js

import { getPool, sql } from '../config/database.js';

export async function subscribe(email) {
  const pool = await getPool();
  const result = await pool.request()
    .input('email', sql.NVarChar, email)
    .query(`
      MERGE newsletter_subscribers AS target
      USING (SELECT @email AS email) AS source ON target.email = source.email
      WHEN MATCHED THEN
        UPDATE SET is_active = 1
      WHEN NOT MATCHED THEN
        INSERT (email, is_active) VALUES (@email, 1);
      SELECT * FROM newsletter_subscribers WHERE email = @email;
    `);
  return result.recordset[0];
}

export async function unsubscribe(email) {
  const pool = await getPool();
  const result = await pool.request()
    .input('email', sql.NVarChar, email)
    .query(`
      UPDATE newsletter_subscribers SET is_active = 0
      OUTPUT INSERTED.*
      WHERE email = @email
    `);
  return result.recordset[0] || null;
}

export async function listSubscribers(page, pageSize) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool.request()
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize)
    .query(`
      SELECT * FROM newsletter_subscribers
      ORDER BY subscribed_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function countSubscribers() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT COUNT(1) AS total FROM newsletter_subscribers');
  return result.recordset[0].total;
}
