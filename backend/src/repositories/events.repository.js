// src/repositories/events.repository.js

import { getPool, sql } from '../config/database.js';

export async function listPublished(page, pageSize, lang = 'vi') {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize)
    .input('lang', sql.VarChar(5), lang).query(`
      SELECT e.id,
             COALESCE(NULLIF(et.title, N''), e.title) AS title,
             COALESCE(NULLIF(et.description, N''), e.description) AS description,
             e.event_at, e.image, e.bg_image, e.link_url, e.sort_order,
             e.is_published, e.created_at
      FROM events e
      LEFT JOIN event_translations et ON et.event_id = e.id AND et.lang_code = @lang
      WHERE e.is_published = 1
      ORDER BY e.sort_order ASC, e.event_at ASC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function countPublished() {
  const pool = await getPool();
  const result = await pool
    .request()
    .query('SELECT COUNT(1) AS total FROM events WHERE is_published = 1');
  return result.recordset[0].total;
}

export async function listAll(page, pageSize) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize).query(`
      SELECT *
      FROM events
      ORDER BY sort_order ASC, event_at ASC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function countAll() {
  const pool = await getPool();
  const result = await pool
    .request()
    .query('SELECT COUNT(1) AS total FROM events');
  return result.recordset[0].total;
}

export async function findById(id) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM events WHERE id = @id');
  return result.recordset[0] || null;
}

export async function createEvent(data) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('title', sql.NVarChar(200), data.title)
    .input('description', sql.NVarChar(500), data.description ?? null)
    .input('eventAt', sql.DateTime2, data.eventAt || data.event_at)
    .input('image', sql.NVarChar(500), data.image ?? null)
    .input('bgImage', sql.NVarChar(500), (data.bgImage || data.bg_image) ?? null)
    .input('linkUrl', sql.NVarChar(500), (data.linkUrl || data.link_url) ?? null)
    .input('sortOrder', sql.Int, data.sortOrder ?? data.sort_order ?? 0)
    .input('isPublished', sql.Bit, data.isPublished !== undefined ? (data.isPublished ? 1 : 0) : 1).query(`
      INSERT INTO events (title, description, event_at, image, bg_image, link_url, sort_order, is_published)
      OUTPUT INSERTED.*
      VALUES (@title, @description, @eventAt, @image, @bgImage, @linkUrl, @sortOrder, @isPublished)
    `);
  return result.recordset[0];
}

export async function updateEvent(id, data) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('title', sql.NVarChar(200), data.title)
    .input('description', sql.NVarChar(500), data.description ?? null)
    .input('eventAt', sql.DateTime2, data.eventAt || data.event_at)
    .input('image', sql.NVarChar(500), data.image ?? null)
    .input('bgImage', sql.NVarChar(500), (data.bgImage || data.bg_image) ?? null)
    .input('linkUrl', sql.NVarChar(500), (data.linkUrl || data.link_url) ?? null)
    .input('sortOrder', sql.Int, data.sortOrder ?? data.sort_order ?? 0)
    .input('isPublished', sql.Bit, data.isPublished !== undefined ? (data.isPublished ? 1 : 0) : 1).query(`
      UPDATE events
      SET title = @title,
          description = @description,
          event_at = @eventAt,
          image = @image,
          bg_image = @bgImage,
          link_url = @linkUrl,
          sort_order = @sortOrder,
          is_published = @isPublished
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}

export async function publish(id, isPublished) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('isPublished', sql.Bit, isPublished ? 1 : 0).query(`
      UPDATE events SET is_published = @isPublished
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}

// ── TRANSLATIONS ─────────────────────────────────────────────

export async function getItemTranslations(eventId) {
  const pool = await getPool();
  const result = await pool.request().input('id', sql.Int, eventId).query(`
      SELECT lang_code, title, description, updated_at
      FROM event_translations
      WHERE event_id = @id
      ORDER BY lang_code
    `);
  return result.recordset;
}

export async function upsertItemTranslation(eventId, langCode, title, description) {
  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();
  try {
    const upd = await new sql.Request(tx)
      .input('id', sql.Int, eventId)
      .input('lang', sql.VarChar(5), langCode)
      .input('title', sql.NVarChar(200), title)
      .input('description', sql.NVarChar(500), description ?? null)
      .query(`UPDATE event_translations WITH (UPDLOCK, HOLDLOCK)
              SET title = @title, description = @description, updated_at = SYSDATETIME()
              WHERE event_id = @id AND lang_code = @lang`);
    if (upd.rowsAffected[0] === 0) {
      await new sql.Request(tx)
        .input('id', sql.Int, eventId)
        .input('lang', sql.VarChar(5), langCode)
        .input('title', sql.NVarChar(200), title)
        .input('description', sql.NVarChar(500), description ?? null)
        .query(`INSERT INTO event_translations (event_id, lang_code, title, description)
                VALUES (@id, @lang, @title, @description)`);
    }
    await tx.commit();
    return { event_id: eventId, lang_code: langCode, title, description };
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}
