import dotenv from 'dotenv';
import { logger } from '../logger/config.js';
import mongoose from 'mongoose';

dotenv.config();

class SessionManager {
  constructor() {
    this.config = {
      session: {
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
      },
      storage: {
        type: process.env.SESSION_STORAGE_TYPE || 'memory',
        options: {
          redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD
          },
          mongodb: {
            uri: process.env.MONGODB_URI,
            collection: 'sessions'
          }
        }
      },
      cleanup: {
        enabled: true,
        interval: 24 * 60 * 60 * 1000, // 24 hours
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      }
    };
    this.sessions = new Map();
  }

  async initialize() {
    try {
      logger.info('Initializing session manager...');

      if (this.config.storage.type === 'mongodb') {
        await this.initializeMongoDB();
      } else if (this.config.storage.type === 'redis') {
        await this.initializeRedis();
      }

      if (this.config.cleanup.enabled) {
        this.startCleanupJob();
      }

      logger.info('Session manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize session manager:', error);
      throw error;
    }
  }

  async initializeMongoDB() {
    try {
      if (!this.config.storage.options.mongodb.uri) {
        throw new Error('MongoDB URI is not configured');
      }

      await mongoose.connect(this.config.storage.options.mongodb.uri);
      logger.info('Connected to MongoDB for session storage');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async initializeRedis() {
    try {
      const { createClient } = await import('redis');
      const client = createClient({
        url: `redis://${this.config.storage.options.redis.host}:${this.config.storage.options.redis.port}`,
        password: this.config.storage.options.redis.password
      });

      client.on('error', (err) => logger.error('Redis Client Error:', err));
      await client.connect();
      this.redisClient = client;
      logger.info('Connected to Redis for session storage');
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  startCleanupJob() {
    setInterval(() => {
      this.cleanupSessions();
    }, this.config.cleanup.interval);
  }

  async cleanupSessions() {
    try {
      const now = Date.now();
      const expiredSessions = [];

      for (const [sessionId, session] of this.sessions.entries()) {
        if (now - session.lastAccess > this.config.cleanup.maxAge) {
          expiredSessions.push(sessionId);
        }
      }

      for (const sessionId of expiredSessions) {
        await this.destroySession(sessionId);
      }

      logger.info(`Cleaned up ${expiredSessions.length} expired sessions`);
    } catch (error) {
      logger.error('Failed to cleanup sessions:', error);
    }
  }

  async createSession(userId, data = {}) {
    try {
      const sessionId = this.generateSessionId();
      const session = {
        id: sessionId,
        userId,
        data,
        createdAt: Date.now(),
        lastAccess: Date.now()
      };

      if (this.config.storage.type === 'mongodb') {
        await this.storeSessionInMongoDB(session);
      } else if (this.config.storage.type === 'redis') {
        await this.storeSessionInRedis(session);
      } else {
        this.sessions.set(sessionId, session);
      }

      logger.info(`Created new session for user ${userId}`);
      return sessionId;
    } catch (error) {
      logger.error('Failed to create session:', error);
      throw error;
    }
  }

  async getSession(sessionId) {
    try {
      let session;

      if (this.config.storage.type === 'mongodb') {
        session = await this.getSessionFromMongoDB(sessionId);
      } else if (this.config.storage.type === 'redis') {
        session = await this.getSessionFromRedis(sessionId);
      } else {
        session = this.sessions.get(sessionId);
      }

      if (session) {
        session.lastAccess = Date.now();
        await this.updateSession(sessionId, session);
      }

      return session;
    } catch (error) {
      logger.error('Failed to get session:', error);
      throw error;
    }
  }

  async updateSession(sessionId, data) {
    try {
      if (this.config.storage.type === 'mongodb') {
        await this.updateSessionInMongoDB(sessionId, data);
      } else if (this.config.storage.type === 'redis') {
        await this.updateSessionInRedis(sessionId, data);
      } else {
        const session = this.sessions.get(sessionId);
        if (session) {
          this.sessions.set(sessionId, { ...session, ...data });
        }
      }
    } catch (error) {
      logger.error('Failed to update session:', error);
      throw error;
    }
  }

  async destroySession(sessionId) {
    try {
      if (this.config.storage.type === 'mongodb') {
        await this.destroySessionInMongoDB(sessionId);
      } else if (this.config.storage.type === 'redis') {
        await this.destroySessionInRedis(sessionId);
      } else {
        this.sessions.delete(sessionId);
      }

      logger.info(`Destroyed session ${sessionId}`);
    } catch (error) {
      logger.error('Failed to destroy session:', error);
      throw error;
    }
  }

  generateSessionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async shutdown() {
    try {
      if (this.config.storage.type === 'redis' && this.redisClient) {
        await this.redisClient.quit();
      }
      logger.info('Session manager shut down successfully');
    } catch (error) {
      logger.error('Error during session manager shutdown:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const sessionManager = new SessionManager(); 