// src/repositories/reviews.repository.js

import { getPool, sql } from '../config/database.js';

export async function listPublished(page, pageSize, lang = 'vi') {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize)
    .input('lang', sql.VarChar(5), lang).query(`
      SELECT r.id, r.customer_id, r.rating,
             COALESCE(NULLIF(rt.content, N''), r.content) AS content,
             r.is_published, r.created_at,
             c.full_name, c.phone,
             u.avatar
      FROM reviews r
      JOIN customers c ON c.id = r.customer_id
      LEFT JOIN users u ON u.id = c.user_id
      LEFT JOIN reviews_translations rt ON rt.review_id = r.id AND rt.lang_code = @lang
      WHERE r.is_published = 1
      ORDER BY r.created_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function countPublished() {
  const pool = await getPool();
  const result = await pool
    .request()
    .query('SELECT COUNT(1) AS total FROM reviews WHERE is_published = 1');
  return result.recordset[0].total;
}

export async function listAll(page, pageSize) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize).query(`
      SELECT r.*, c.full_name, c.phone, u.avatar
      FROM reviews r
      JOIN customers c ON c.id = r.customer_id
      LEFT JOIN users u ON u.id = c.user_id
      ORDER BY r.created_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function countAll() {
  const pool = await getPool();
  const result = await pool
    .request()
    .query('SELECT COUNT(1) AS total FROM reviews');
  return result.recordset[0].total;
}

export async function createReview(customerId, rating, content) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('customerId', sql.Int, customerId)
    .input('rating', sql.Int, rating)
    .input('content', sql.NVarChar, content ?? null).query(`
      INSERT INTO reviews (customer_id, rating, content, is_published)
      OUTPUT INSERTED.*
      VALUES (@customerId, @rating, @content, 0)
    `);
  return result.recordset[0];
}

export async function publish(id, isPublished) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('isPublished', sql.Bit, isPublished ? 1 : 0).query(`
      UPDATE reviews SET is_published = @isPublished
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}
// ── TRANSLATIONS ─────────────────────────────────────────────

export async function getItemTranslations(reviewId) {
  const pool = await getPool();
  const result = await pool.request().input('id', sql.Int, reviewId).query(`
      SELECT lang_code, content, updated_at
      FROM reviews_translations
      WHERE review_id = @id
      ORDER BY lang_code
    `);
  return result.recordset;
}

export async function upsertItemTranslation(reviewId, langCode, content) {
  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();
  try {
    const upd = await new sql.Request(tx)
      .input('id', sql.Int, reviewId)
      .input('lang', sql.VarChar(5), langCode)
      .input('content', sql.NVarChar(sql.MAX), content)
      .query(`UPDATE reviews_translations WITH (UPDLOCK, HOLDLOCK)
              SET content = @content, updated_at = SYSDATETIME()
              WHERE review_id = @id AND lang_code = @lang`);
    if (upd.rowsAffected[0] === 0) {
      await new sql.Request(tx)
        .input('id', sql.Int, reviewId)
        .input('lang', sql.VarChar(5), langCode)
        .input('content', sql.NVarChar(sql.MAX), content)
        .query(`INSERT INTO reviews_translations (review_id, lang_code, content)
                VALUES (@id, @lang, @content)`);
    }
    await tx.commit();
    return { review_id: reviewId, lang_code: langCode, content };
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}
