// src/repositories/gallery.repository.js

import { getPool, sql } from '../config/database.js';

export async function listVisible(lang = 'vi') {
  const pool = await getPool();
  const result = await pool.request()
    .input('lang', sql.VarChar(5), lang)
    .query(`
      SELECT g.id,
             COALESCE(NULLIF(git.title, N''), g.title) AS title,
             g.thumb_url, g.image_url, g.sort_order, g.is_visible, g.created_at
      FROM gallery_images g
      LEFT JOIN gallery_image_translations git ON git.image_id = g.id AND git.lang_code = @lang
      WHERE g.is_visible = 1
      ORDER BY g.sort_order
    `);
  return result.recordset;
}

export async function listAll() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT * FROM gallery_images ORDER BY sort_order');
  return result.recordset;
}

export async function findImageById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM gallery_images WHERE id = @id');
  return result.recordset[0] || null;
}

export async function createImage(title, thumbUrl, imageUrl, sortOrder) {
  const pool = await getPool();
  const result = await pool.request()
    .input('title', sql.NVarChar, title ?? null)
    .input('thumbUrl', sql.NVarChar, thumbUrl)
    .input('imageUrl', sql.NVarChar, imageUrl)
    .input('sortOrder', sql.Int, sortOrder ?? 0)
    .query(`
      INSERT INTO gallery_images (title, thumb_url, image_url, sort_order)
      OUTPUT INSERTED.*
      VALUES (@title, @thumbUrl, @imageUrl, @sortOrder)
    `);
  return result.recordset[0];
}

export async function updateImage(id, fields) {
  const pool = await getPool();
  const sets = [];
  const req = pool.request().input('id', sql.Int, id);
  if (fields.title !== undefined) {
    sets.push('title = @title');
    req.input('title', sql.NVarChar, fields.title);
  }
  if (fields.thumb_url !== undefined) {
    sets.push('thumb_url = @thumbUrl');
    req.input('thumbUrl', sql.NVarChar, fields.thumb_url);
  }
  if (fields.image_url !== undefined) {
    sets.push('image_url = @imageUrl');
    req.input('imageUrl', sql.NVarChar, fields.image_url);
  }
  if (fields.sort_order !== undefined) {
    sets.push('sort_order = @sortOrder');
    req.input('sortOrder', sql.Int, fields.sort_order);
  }
  if (fields.is_visible !== undefined) {
    sets.push('is_visible = @isVisible');
    req.input('isVisible', sql.Bit, fields.is_visible ? 1 : 0);
  }
  if (!sets.length) {
    return findImageById(id);
  }
  const result = await req.query(`
    UPDATE gallery_images SET ${sets.join(', ')}
    OUTPUT INSERTED.*
    WHERE id = @id
  `);
  return result.recordset[0] || null;
}

// ── TRANSLATIONS ─────────────────────────────────────────────

export async function getImageTranslations(imageId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, imageId)
    .query(`
      SELECT lang_code, title, updated_at
      FROM gallery_image_translations
      WHERE image_id = @id
      ORDER BY lang_code
    `);
  return result.recordset;
}

export async function upsertImageTranslation(imageId, langCode, title) {
  const pool = await getPool();
  const tx = pool.transaction();
  await tx.begin();
  try {
    const upd = await new sql.Request(tx)
      .input('id', sql.Int, imageId)
      .input('lang', sql.VarChar(5), langCode)
      .input('title', sql.NVarChar(150), title)
      .query(`UPDATE gallery_image_translations WITH (UPDLOCK, HOLDLOCK)
              SET title = @title, updated_at = SYSDATETIME()
              WHERE image_id = @id AND lang_code = @lang`);
    if (upd.rowsAffected[0] === 0) {
      await new sql.Request(tx)
        .input('id', sql.Int, imageId)
        .input('lang', sql.VarChar(5), langCode)
        .input('title', sql.NVarChar(150), title)
        .query(`INSERT INTO gallery_image_translations (image_id, lang_code, title)
                VALUES (@id, @lang, @title)`);
    }
    await tx.commit();
    return { image_id: imageId, lang_code: langCode, title };
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}
