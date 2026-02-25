/**
 * Middleware centralizador de errores
 */

import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error('Error no manejado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
  });

  // Errores de BD
  if (err.code && err.code.startsWith('ERR_')) {
    return res.status(503).json({
      ok: false,
      error: 'Database connection error',
      code: err.code,
    });
  }

  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      ok: false,
      error: err.message,
    });
  }

  // Errores por defecto
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || 'Internal server error',
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    error: 'Not found',
    path: req.originalUrl,
  });
}

export default { errorHandler, notFoundHandler };
