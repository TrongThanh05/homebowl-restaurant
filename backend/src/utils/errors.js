// src/utils/errors.js
// Custom HTTP error classes and factory functions

export class HttpError extends Error {
  constructor(statusCode, message, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'HttpError';
  }
}

export function badRequest(message, code = 'BAD_REQUEST') {
  return new HttpError(400, message, code);
}

export function unauthorized(message = 'Chưa đăng nhập') {
  return new HttpError(401, message, 'UNAUTHORIZED');
}

export function forbidden(message = 'Không đủ quyền') {
  return new HttpError(403, message, 'FORBIDDEN');
}

export function notFound(message = 'Không tìm thấy') {
  return new HttpError(404, message, 'NOT_FOUND');
}

export function conflict(message, code = 'CONFLICT') {
  return new HttpError(409, message, code);
}

export function internal(message = 'Lỗi hệ thống') {
  return new HttpError(500, message, 'INTERNAL_ERROR');
}
