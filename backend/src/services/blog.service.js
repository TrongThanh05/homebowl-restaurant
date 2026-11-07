// src/services/blog.service.js

import * as blogRepo from '../repositories/blog.repository.js';
import { badRequest, notFound } from '../utils/errors.js';

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') + '-' + Date.now();
}

// ── POSTS ─────────────────────────────────────────────────────

export async function listPosts(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '10', 10)));
  const categorySlug = query.categorySlug || null;

  const [items, total] = await Promise.all([
    blogRepo.listPosts(page, pageSize, categorySlug),
    blogRepo.countPosts(categorySlug),
  ]);
  return { items, meta: { page, pageSize, total } };
}

export async function getPostBySlug(slug) {
  const post = await blogRepo.findPostBySlug(slug);
  if (!post) throw notFound('Bài viết không tồn tại');
  return post;
}

export async function getMostViewed(query) {
  const limit = Math.min(50, Math.max(1, parseInt(query.limit || '5', 10)));
  return blogRepo.getMostViewed(limit);
}

export async function getArchive() {
  return blogRepo.getArchive();
}

export async function createPost(body, user) {
  const { title, slug, excerpt, content, image_url, category_ids } = body;
  if (!title || !title.trim()) throw badRequest('Tiêu đề bài viết là bắt buộc');
  if (!content) throw badRequest('Nội dung bài viết là bắt buộc');

  const finalSlug = slug || generateSlug(title);
  const authorId = user?.id ?? null;

  const post = await blogRepo.createPost(authorId, title.trim(), finalSlug, excerpt, content, image_url);

  if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
    await blogRepo.setPostCategories(post.id, category_ids);
  }

  return post;
}

export async function updatePost(id, body) {
  const post = await blogRepo.findPostById(Number(id));
  if (!post) throw notFound('Bài viết không tồn tại');

  const updated = await blogRepo.updatePost(Number(id), body);

  if (body.category_ids && Array.isArray(body.category_ids)) {
    await blogRepo.setPostCategories(Number(id), body.category_ids);
  }

  return updated;
}

// ── CATEGORIES ────────────────────────────────────────────────

export async function listBlogCategories() {
  return blogRepo.listBlogCategories();
}

// ── COMMENTS ─────────────────────────────────────────────────

export async function listPendingComments(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '10', 10)));
  const [items, total] = await Promise.all([
    blogRepo.listPendingComments(page, pageSize),
    blogRepo.countPendingComments(),
  ]);
  return { items, meta: { page, pageSize, total } };
}

export async function createComment(body) {
  const { post_id, customer_id, author_name, content } = body;
  if (!post_id) throw badRequest('post_id là bắt buộc');
  if (!author_name || !author_name.trim()) throw badRequest('Tên tác giả là bắt buộc');
  if (!content || !content.trim()) throw badRequest('Nội dung bình luận là bắt buộc');
  return blogRepo.createComment(Number(post_id), customer_id ?? null, author_name.trim(), content.trim());
}

export async function approveComment(id, body) {
  const { is_approved } = body;
  if (is_approved === undefined) throw badRequest('Trường is_approved là bắt buộc');
  const comment = await blogRepo.approveComment(Number(id), Boolean(is_approved));
  if (!comment) throw notFound('Bình luận không tồn tại');
  return comment;
}
