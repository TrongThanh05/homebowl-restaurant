// src/repositories/blog.repository.js

import { getPool, sql } from '../config/database.js';

// ── POSTS ────────────────────────────────────────────────────

export async function listPosts(page, pageSize, categorySlug) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool.request()
    .input('categorySlug', sql.NVarChar, categorySlug ?? null)
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize)
    .query(`
      SELECT DISTINCT
        p.id, p.title, p.slug, p.excerpt, p.image_url, p.view_count,
        p.is_published, p.published_at, p.created_at,
        e.full_name AS author_name,
        (SELECT COUNT(1) FROM blog_comments bc
         WHERE bc.post_id = p.id AND bc.is_approved = 1) AS comment_count
      FROM blog_posts p
      LEFT JOIN employees e ON e.user_id = p.author_id
      LEFT JOIN blog_post_categories bpc ON bpc.post_id = p.id
      LEFT JOIN blog_categories bc2 ON bc2.id = bpc.category_id
      WHERE p.is_published = 1
        AND (@categorySlug IS NULL OR bc2.slug = @categorySlug)
      ORDER BY p.published_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function countPosts(categorySlug) {
  const pool = await getPool();
  const result = await pool.request()
    .input('categorySlug', sql.NVarChar, categorySlug ?? null)
    .query(`
      SELECT COUNT(DISTINCT p.id) AS total
      FROM blog_posts p
      LEFT JOIN blog_post_categories bpc ON bpc.post_id = p.id
      LEFT JOIN blog_categories bc ON bc.id = bpc.category_id
      WHERE p.is_published = 1
        AND (@categorySlug IS NULL OR bc.slug = @categorySlug)
    `);
  return result.recordset[0].total;
}

export async function findPostBySlug(slug) {
  const pool = await getPool();
  // Increment view count and return
  await pool.request()
    .input('slug', sql.NVarChar, slug)
    .query('UPDATE blog_posts SET view_count = view_count + 1 WHERE slug = @slug');

  const result = await pool.request()
    .input('slug', sql.NVarChar, slug)
    .query(`
      SELECT p.*, e.full_name AS author_name
      FROM blog_posts p
      LEFT JOIN employees e ON e.user_id = p.author_id
      WHERE p.slug = @slug
    `);
  return result.recordset[0] || null;
}

export async function findPostById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM blog_posts WHERE id = @id');
  return result.recordset[0] || null;
}

export async function createPost(authorId, title, slug, excerpt, content, imageUrl) {
  const pool = await getPool();
  const result = await pool.request()
    .input('authorId', sql.Int, authorId ?? null)
    .input('title', sql.NVarChar, title)
    .input('slug', sql.NVarChar, slug)
    .input('excerpt', sql.NVarChar, excerpt ?? null)
    .input('content', sql.NVarChar(sql.MAX), content)
    .input('imageUrl', sql.NVarChar, imageUrl ?? null)
    .query(`
      INSERT INTO blog_posts (author_id, title, slug, excerpt, content, image_url)
      OUTPUT INSERTED.*
      VALUES (@authorId, @title, @slug, @excerpt, @content, @imageUrl)
    `);
  return result.recordset[0];
}

export async function setPostCategories(postId, categoryIds) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    await transaction.request()
      .input('postId', sql.Int, postId)
      .query('DELETE FROM blog_post_categories WHERE post_id = @postId');

    for (const catId of categoryIds) {
      await transaction.request()
        .input('postId', sql.Int, postId)
        .input('catId', sql.Int, catId)
        .query('INSERT INTO blog_post_categories (post_id, category_id) VALUES (@postId, @catId)');
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

export async function updatePost(id, fields) {
  const pool = await getPool();
  const sets = [];
  const req = pool.request().input('id', sql.Int, id);
  if (fields.title !== undefined) {
    sets.push('title = @title');
    req.input('title', sql.NVarChar, fields.title);
  }
  if (fields.slug !== undefined) {
    sets.push('slug = @slug');
    req.input('slug', sql.NVarChar, fields.slug);
  }
  if (fields.excerpt !== undefined) {
    sets.push('excerpt = @excerpt');
    req.input('excerpt', sql.NVarChar, fields.excerpt);
  }
  if (fields.content !== undefined) {
    sets.push('content = @content');
    req.input('content', sql.NVarChar(sql.MAX), fields.content);
  }
  if (fields.image_url !== undefined) {
    sets.push('image_url = @imageUrl');
    req.input('imageUrl', sql.NVarChar, fields.image_url);
  }
  if (fields.is_published !== undefined) {
    sets.push('is_published = @isPublished');
    req.input('isPublished', sql.Bit, fields.is_published ? 1 : 0);
    if (fields.is_published) {
      sets.push('published_at = SYSDATETIME()');
    }
  }
  if (!sets.length) return findPostById(id);
  const result = await req.query(`
    UPDATE blog_posts SET ${sets.join(', ')}
    OUTPUT INSERTED.*
    WHERE id = @id
  `);
  return result.recordset[0] || null;
}

export async function getMostViewed(limit = 5) {
  const pool = await getPool();
  const result = await pool.request()
    .input('limit', sql.Int, limit)
    .query(`
      SELECT TOP(@limit) id, title, slug, excerpt, image_url, view_count, published_at
      FROM blog_posts
      WHERE is_published = 1
      ORDER BY view_count DESC
    `);
  return result.recordset;
}

export async function getArchive() {
  const pool = await getPool();
  const result = await pool.request()
    .query(`
      SELECT YEAR(published_at) AS year, MONTH(published_at) AS month,
             COUNT(1) AS post_count
      FROM blog_posts
      WHERE is_published = 1
      GROUP BY YEAR(published_at), MONTH(published_at)
      ORDER BY year DESC, month DESC
    `);
  return result.recordset;
}

// ── CATEGORIES ────────────────────────────────────────────────

export async function listBlogCategories() {
  const pool = await getPool();
  const result = await pool.request()
    .query(`
      SELECT bc.id, bc.name, bc.slug, bc.sort_order,
             COUNT(bpc.post_id) AS post_count
      FROM blog_categories bc
      LEFT JOIN blog_post_categories bpc ON bpc.category_id = bc.id
      LEFT JOIN blog_posts p ON p.id = bpc.post_id AND p.is_published = 1
      GROUP BY bc.id, bc.name, bc.slug, bc.sort_order
      ORDER BY bc.sort_order
    `);
  return result.recordset;
}

export async function findBlogCategoryBySlug(slug) {
  const pool = await getPool();
  const result = await pool.request()
    .input('slug', sql.NVarChar, slug)
    .query('SELECT * FROM blog_categories WHERE slug = @slug');
  return result.recordset[0] || null;
}

// ── COMMENTS ─────────────────────────────────────────────────

export async function listComments(postId, page, pageSize) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool.request()
    .input('postId', sql.Int, postId)
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize)
    .query(`
      SELECT * FROM blog_comments
      WHERE post_id = @postId AND is_approved = 1
      ORDER BY created_at ASC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function createComment(postId, customerId, authorName, content) {
  const pool = await getPool();
  const result = await pool.request()
    .input('postId', sql.Int, postId)
    .input('customerId', sql.Int, customerId ?? null)
    .input('authorName', sql.NVarChar, authorName)
    .input('content', sql.NVarChar, content)
    .query(`
      INSERT INTO blog_comments (post_id, customer_id, author_name, content, is_approved)
      OUTPUT INSERTED.*
      VALUES (@postId, @customerId, @authorName, @content, 0)
    `);
  return result.recordset[0];
}

export async function approveComment(id, isApproved) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('isApproved', sql.Bit, isApproved ? 1 : 0)
    .query(`
      UPDATE blog_comments SET is_approved = @isApproved
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}

export async function listPendingComments(page, pageSize) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const result = await pool.request()
    .input('offset', sql.Int, offset)
    .input('pageSize', sql.Int, pageSize)
    .query(`
      SELECT bc.*, bp.title AS post_title
      FROM blog_comments bc
      JOIN blog_posts bp ON bp.id = bc.post_id
      WHERE bc.is_approved = 0
      ORDER BY bc.created_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);
  return result.recordset;
}

export async function countPendingComments() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT COUNT(1) AS total FROM blog_comments WHERE is_approved = 0');
  return result.recordset[0].total;
}
