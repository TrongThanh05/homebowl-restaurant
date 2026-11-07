// src/config/env.js
// Reads and validates environment variables

const REQUIRED = ['DB_SERVER', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];

for (const key of REQUIRED) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  CORS_ORIGINS: (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
  DB_SERVER: process.env.DB_SERVER,
  DB_PORT: parseInt(process.env.DB_PORT || '1433', 10),
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_ENCRYPT: process.env.DB_ENCRYPT === 'true',
  DB_TRUST_SERVER_CERT: process.env.DB_TRUST_SERVER_CERT !== 'false',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  MAX_BODY_BYTES: parseInt(process.env.MAX_BODY_BYTES || '102400', 10),
};
