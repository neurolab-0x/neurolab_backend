import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

class LoggerService {
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'neurolab-backend' },
      transports: [
        // Write all logs with level 'error' and below to 'error.log'
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        }),
        // Write all logs with level 'info' and below to 'combined.log'
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        })
      ]
    });

    // If we're not in production, also log to the console
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }

    // Create a stream object for Morgan
    this.stream = {
      write: (message) => {
        this.logger.info(message.trim());
      }
    };
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // Method to get the Morgan stream
  getStream() {
    return this.stream;
  }
}

// Create and export a singleton instance
export const loggerService = new LoggerService();
export const logger = loggerService.logger; 