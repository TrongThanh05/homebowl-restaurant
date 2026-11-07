// src/controllers/employees.controller.js

import * as employeesService from '../services/employees.service.js';
import { sendSuccess, sendError, readJsonBody } from '../utils/http.js';
import { env } from '../config/env.js';

export async function listEmployees(req, res) {
  try {
    const query = Object.fromEntries(new URL('http://x' + req.url).searchParams);
    const data = await employeesService.listEmployees(query);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function getEmployee(req, res) {
  try {
    const data = await employeesService.getEmployeeById(req.params.id);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function createEmployee(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await employeesService.createEmployee(body);
    sendSuccess(res, data, 201);
  } catch (err) { sendError(res, err); }
}

export async function updateEmployee(req, res) {
  try {
    const body = await readJsonBody(req, env.MAX_BODY_BYTES);
    const data = await employeesService.updateEmployee(req.params.id, body);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}

export async function deactivateEmployee(req, res) {
  try {
    const data = await employeesService.deactivateEmployee(req.params.id);
    sendSuccess(res, data);
  } catch (err) { sendError(res, err); }
}
