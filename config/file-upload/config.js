import dotenv from 'dotenv';
import { logger } from '../logger/config.js';
import cloudinary from '../cloudinary.config.js';
import path from 'path';
import fs from 'fs/promises';

dotenv.config();

class FileUploadService {
  constructor() {
    this.config = {
      storage: {
        type: process.env.FILE_STORAGE_TYPE || 'cloudinary',
        options: {
          local: {
            uploadDir: process.env.UPLOAD_DIR || 'uploads',
            maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
            allowedMimeTypes: [
              'image/jpeg',
              'image/png',
              'image/gif',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'text/csv',
              'test/edf',
              'application/json'
            ]
          },
          cloudinary: {
            folder: process.env.CLOUDINARY_FOLDER || 'neurolab',
            allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'csv', 'json'],
            maxFileSize: parseInt(process.env.CLOUDINARY_MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
          }
        }
      },
      processing: {
        image: {
          resize: {
            enabled: true,
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 80
          },
          thumbnail: {
            enabled: true,
            width: 300,
            height: 300
          }
        }
      },
      security: {
        virusScan: {
          enabled: process.env.ENABLE_VIRUS_SCAN === 'true',
          provider: process.env.VIRUS_SCAN_PROVIDER || 'clamav'
        },
        sanitization: {
          enabled: true,
          removeMetadata: true
        }
      }
    };
    this.isInitialized = false;
  }

  async initialize() {
    try {
      logger.info('Initializing file upload service...');

      if (this.config.storage.type === 'local') {
        await this.initializeLocalStorage();
      }

      this.isInitialized = true;
      logger.info('File upload service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize file upload service:', error);
      throw error;
    }
  }

  async initializeLocalStorage() {
    try {
      const uploadDir = this.config.storage.options.local.uploadDir;
      await fs.mkdir(uploadDir, { recursive: true });
      logger.info(`Local storage directory initialized: ${uploadDir}`);
    } catch (error) {
      logger.error('Failed to initialize local storage:', error);
      throw error;
    }
  }

  async uploadFile(file, options = {}) {
    if (!this.isInitialized) {
      throw new Error('File upload service not initialized');
    }

    try {
      // Validate file
      this.validateFile(file);

      // Process file based on type
      if (this.isImageFile(file.mimetype)) {
        file = await this.processImage(file);
      }

      // Upload file
      let result;
      if (this.config.storage.type === 'cloudinary') {
        result = await this.uploadToCloudinary(file, options);
      } else {
        result = await this.uploadToLocal(file, options);
      }

      return result;
    } catch (error) {
      logger.error('Failed to upload file:', error);
      throw error;
    }
  }

  validateFile(file) {
    const { maxFileSize, allowedMimeTypes } = this.config.storage.options.local;

    if (file.size > maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${maxFileSize} bytes`);
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed`);
    }
  }

  isImageFile(mimetype) {
    return mimetype.startsWith('image/');
  }

  async processImage(file) {
    if (!this.config.processing.image.resize.enabled) {
      return file;
    }

    try {
      const { maxWidth, maxHeight, quality } = this.config.processing.image.resize;

      // Upload to Cloudinary with transformation
      const result = await cloudinary.uploader.upload(file.path, {
        transformation: [
          { width: maxWidth, height: maxHeight, crop: 'limit' },
          { quality: quality }
        ]
      });

      // Create thumbnail if enabled
      if (this.config.processing.image.thumbnail.enabled) {
        const { width, height } = this.config.processing.image.thumbnail;
        await cloudinary.uploader.upload(file.path, {
          transformation: [
            { width, height, crop: 'fill' }
          ],
          public_id: `${result.public_id}_thumb`
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to process image:', error);
      throw error;
    }
  }

  async uploadToCloudinary(file, options = {}) {
    try {
      const uploadOptions = {
        folder: this.config.storage.options.cloudinary.folder,
        resource_type: 'auto',
        ...options
      };

      const result = await cloudinary.uploader.upload(file.path, uploadOptions);
      logger.info(`File uploaded to Cloudinary: ${result.public_id}`);
      return result;
    } catch (error) {
      logger.error('Failed to upload to Cloudinary:', error);
      throw error;
    }
  }

  async uploadToLocal(file, options = {}) {
    try {
      const uploadDir = this.config.storage.options.local.uploadDir;
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.writeFile(filePath, file.buffer);
      logger.info(`File uploaded to local storage: ${filePath}`);

      return {
        url: `/uploads/${fileName}`,
        path: filePath,
        size: file.size,
        mimetype: file.mimetype
      };
    } catch (error) {
      logger.error('Failed to upload to local storage:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      if (this.config.storage.type === 'cloudinary') {
        await cloudinary.uploader.destroy(fileId);
        logger.info(`File deleted from Cloudinary: ${fileId}`);
      } else {
        const filePath = path.join(this.config.storage.options.local.uploadDir, fileId);
        await fs.unlink(filePath);
        logger.info(`File deleted from local storage: ${filePath}`);
      }
    } catch (error) {
      logger.error('Failed to delete file:', error);
      throw error;
    }
  }

  async shutdown() {
    try {
      logger.info('File upload service shut down successfully');
    } catch (error) {
      logger.error('Error during file upload service shutdown:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const fileUploadService = new FileUploadService(); 