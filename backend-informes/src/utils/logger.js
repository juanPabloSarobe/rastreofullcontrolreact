/**
 * Logger centralizado
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLevel = LOG_LEVELS.info;

export function setLogLevel(level) {
  if (LOG_LEVELS[level] !== undefined) {
    currentLevel = LOG_LEVELS[level];
  }
}

function formatMessage(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (data) {
    return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
  }
  return `${prefix} ${message}`;
}

export const logger = {
  debug: (message, data) => {
    if (currentLevel <= LOG_LEVELS.debug) {
      console.log(formatMessage('debug', message, data));
    }
  },
  info: (message, data) => {
    if (currentLevel <= LOG_LEVELS.info) {
      console.log(formatMessage('info', message, data));
    }
  },
  warn: (message, data) => {
    if (currentLevel <= LOG_LEVELS.warn) {
      console.warn(formatMessage('warn', message, data));
    }
  },
  error: (message, data) => {
    if (currentLevel <= LOG_LEVELS.error) {
      console.error(formatMessage('error', message, data));
    }
  },
};

export { setLogLevel, logger };
