import dotenv from 'dotenv';
import { logger } from '../logger/config.js';
import mongoose from 'mongoose';

dotenv.config();

class DataProcessor {
  constructor() {
    this.config = {
      processing: {
        batchSize: parseInt(process.env.DATA_BATCH_SIZE) || 100,
        maxConcurrent: parseInt(process.env.MAX_CONCURRENT_PROCESSING) || 5,
        timeout: parseInt(process.env.PROCESSING_TIMEOUT) || 30000, // 30 seconds
      },
      validation: {
        enabled: true,
        schema: {
          required: ['timestamp', 'deviceId', 'data'],
          types: {
            timestamp: 'number',
            deviceId: 'string',
            data: 'object'
          }
        }
      },
      transformation: {
        enabled: true,
        rules: {
          normalize: true,
          filter: true,
          aggregate: true
        }
      },
      storage: {
        type: process.env.DATA_STORAGE_TYPE || 'mongodb',
        options: {
          mongodb: {
            uri: process.env.MONGODB_URI,
            collection: 'processed_data'
          }
        }
      },
      errorHandling: {
        maxRetries: 3,
        retryDelay: 5000, // 5 seconds
        deadLetterQueue: true
      }
    };
    this.processingQueue = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      logger.info('Initializing data processor...');

      if (this.config.storage.type === 'mongodb') {
        await this.initializeMongoDB();
      }

      this.isInitialized = true;
      logger.info('Data processor initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize data processor:', error);
      throw error;
    }
  }

  async initializeMongoDB() {
    try {
      if (!this.config.storage.options.mongodb.uri) {
        throw new Error('MongoDB URI is not configured');
      }

      await mongoose.connect(this.config.storage.options.mongodb.uri);
      logger.info('Connected to MongoDB for data storage');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async processData(data) {
    if (!this.isInitialized) {
      throw new Error('Data processor not initialized');
    }

    try {
      // Validate data
      if (this.config.validation.enabled) {
        this.validateData(data);
      }

      // Transform data
      if (this.config.transformation.enabled) {
        data = await this.transformData(data);
      }

      // Store processed data
      await this.storeData(data);

      return data;
    } catch (error) {
      logger.error('Failed to process data:', error);
      throw error;
    }
  }

  validateData(data) {
    const { required, types } = this.config.validation.schema;

    // Check required fields
    for (const field of required) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Check field types
    for (const [field, type] of Object.entries(types)) {
      if (field in data && typeof data[field] !== type) {
        throw new Error(`Invalid type for field ${field}: expected ${type}`);
      }
    }
  }

  async transformData(data) {
    const { rules } = this.config.transformation;

    if (rules.normalize) {
      data = this.normalizeData(data);
    }

    if (rules.filter) {
      data = this.filterData(data);
    }

    if (rules.aggregate) {
      data = await this.aggregateData(data);
    }

    return data;
  }

  normalizeData(data) {
    // Implement data normalization logic
    return data;
  }

  filterData(data) {
    // Implement data filtering logic
    return data;
  }

  async aggregateData(data) {
    // Implement data aggregation logic
    return data;
  }

  async storeData(data) {
    try {
      if (this.config.storage.type === 'mongodb') {
        await this.storeInMongoDB(data);
      }
    } catch (error) {
      logger.error('Failed to store data:', error);
      throw error;
    }
  }

  async storeInMongoDB(data) {
    try {
      const collection = mongoose.connection.collection(this.config.storage.options.mongodb.collection);
      await collection.insertOne({
        ...data,
        processedAt: new Date(),
        status: 'processed'
      });
    } catch (error) {
      logger.error('Failed to store data in MongoDB:', error);
      throw error;
    }
  }

  async processBatch(dataArray) {
    const results = [];
    const errors = [];

    for (const data of dataArray) {
      try {
        const result = await this.processData(data);
        results.push(result);
      } catch (error) {
        errors.push({ data, error });
      }
    }

    return { results, errors };
  }

  async shutdown() {
    try {
      if (this.config.storage.type === 'mongodb') {
        await mongoose.connection.close();
      }
      logger.info('Data processor shut down successfully');
    } catch (error) {
      logger.error('Error during data processor shutdown:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const dataProcessor = new DataProcessor(); 