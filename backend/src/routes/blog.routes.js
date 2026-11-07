// src/routes/blog.routes.js

import { createRouter } from '../utils/router.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import {
  listPosts, getMostViewed, getArchive, getPostBySlug, createPost, updatePost,
  listBlogCategories,
  listPendingComments, createComment, approveComment,
} from '../controllers/blog.controller.js';

const router = createRouter();

// Blog posts — static routes before /:slug
router.get('/blog-posts/most-viewed', getMostViewed);
router.get('/blog-posts/archive', getArchive);
router.get('/blog-posts', listPosts);
router.get('/blog-posts/:slug', getPostBySlug);
router.post('/blog-posts', authenticate, requireRole('MANAGER', 'ADMIN'), createPost);
router.patch('/blog-posts/:id', authenticate, requireRole('MANAGER', 'ADMIN'), updatePost);

// Blog categories
router.get('/blog-categories', listBlogCategories);

// Blog comments
router.get('/blog-comments', authenticate, requireRole('MANAGER', 'ADMIN'), listPendingComments);
router.post('/blog-comments', createComment);
router.patch('/blog-comments/:id/approve', authenticate, requireRole('MANAGER', 'ADMIN'), approveComment);

export default router;
