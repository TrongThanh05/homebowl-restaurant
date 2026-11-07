// src/controllers/blog.controller.js

import * as blogService from '../services/blog.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { env } from '../config/env.js';

export async function listPosts(req, res) {
  try {
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await blogService.listPosts(query);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function getMostViewed(req, res) {
  try {
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await blogService.getMostViewed(query);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function getArchive(req, res) {
  try {
    const data = await blogService.getArchive();
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function getPostBySlug(req, res) {
  try {
    const data = await blogService.getPostBySlug(req.params.slug);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function createPost(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await blogService.createPost(body, req.user);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function updatePost(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await blogService.updatePost(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function listBlogCategories(req, res) {
  try {
    const data = await blogService.listBlogCategories();
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function listPendingComments(req, res) {
  try {
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await blogService.listPendingComments(query);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function createComment(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await blogService.createComment(body);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function approveComment(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await blogService.approveComment(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}
