/**
 * Middleware para loguear requests
 */

import { logger } from '../utils/logger.js';

export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;
    
    const logData = {
      method: req.method,
      path: req.path,
      statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };

    if (isError) {
      logger.warn(`${req.method} ${req.path}`, logData);
    } else {
      logger.debug(`${req.method} ${req.path}`, logData);
    }
  });

  next();
}

export default { requestLogger };
