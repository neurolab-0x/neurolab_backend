// utils/logger.js
const winston = require('winston');
const morgan = require('morgan');
const path = require('path');
const { format } = winston;
const appRoot = path.resolve(__dirname, '..');

// Create logs directory path
const logsDir = path.join(appRoot, 'logs');

// Define custom log format
const logFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level.toUpperCase()}] ${message} `;
  
  if (metadata && Object.keys(metadata).length) {
    msg += JSON.stringify(metadata);
  }
  
  return msg;
});

// Create Winston logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    process.env.NODE_ENV === 'development' 
      ? format.colorize()
      : format.uncolorize(),
    logFormat
  ),
  transports: [
    // Console transport (always enabled)
    new winston.transports.Console(),
    // File transports (production only)
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 1024 * 1024 * 5, // 5MB
            maxFiles: 5
          }),
          new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 1024 * 1024 * 10, // 10MB
            maxFiles: 5
          })
        ]
      : [])
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log')
    })
  ]
});

// Morgan configuration for HTTP request logging
const httpLogger = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  {
    stream: {
      write: (message) => logger.info(message.trim())
    },
    skip: (req) => req.originalUrl === '/healthcheck'
  }
);

// Handle uncaught exceptions and rejections
process
  .on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason.stack || reason}`);
  })
  .on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.stack || error}`);
    process.exit(1);
  });

module.exports = {
  logger,
  httpLogger
};