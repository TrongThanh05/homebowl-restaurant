// src/repositories/gallery.repository.js

import { getPool, sql } from '../config/database.js';

export async function listVisible() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT * FROM gallery_images WHERE is_visible = 1 ORDER BY sort_order');
  return result.recordset;
}

export async function listAll() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT * FROM gallery_images ORDER BY sort_order');
  return result.recordset;
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
    const r = await pool.request().input('id', sql.Int, id).query('SELECT * FROM gallery_images WHERE id = @id');
    return r.recordset[0] || null;
  }
  const result = await req.query(`
    UPDATE gallery_images SET ${sets.join(', ')}
    OUTPUT INSERTED.*
    WHERE id = @id
  `);
  return result.recordset[0] || null;
}
