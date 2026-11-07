// src/controllers/reports.controller.js

import * as reportsService from '../services/reports.service.js';
import { sendSuccess, sendError } from '../utils/http.js';

export async function revenueReport(req, res) {
  try {
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await reportsService.revenueReport(query);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function topItemsReport(req, res) {
  try {
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await reportsService.topItemsReport(query);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}
