import { fileUploadService } from '../config/file-upload/config.js';
import { loggerService } from '../config/logger/config.js';

export const fileUploadController = {
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      if (!req.cloudinary) {
        return res.status(500).json({ message: 'Cloudinary upload failed' });
      }

      const fileUpload = await fileUploadService.saveFile(
        req.file,
        req.user._id,
        req.cloudinary
      );
      fileUploadService.processFile(fileUpload._id).catch(error => {
        loggerService.error('Error processing file', {
          fileUploadId: fileUpload._id,
          error: error.message
        });
      });

      res.status(201).json(fileUpload);
    } catch (error) {
      loggerService.logError(error, {
        context: 'uploadFile',
        userId: req.user._id
      });
      res.status(400).json({ message: error.message });
    }
  },

  async getUserUploads(req, res) {
    try {
      const uploads = await fileUploadService.getUserUploads(req.user._id);
      res.json(uploads);
    } catch (error) {
      loggerService.logError(error, {
        context: 'getUserUploads',
        userId: req.user._id
      });
      res.status(500).json({ message: error.message });
    }
  },

  async getUploadStatus(req, res) {
    try {
      const upload = await fileUploadService.getUploadStatus(req.params.uploadId);

      if (!upload) {
        return res.status(404).json({ message: 'Upload not found' });
      }

      if (upload.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(upload);
    } catch (error) {
      loggerService.logError(error, {
        context: 'getUploadStatus',
        uploadId: req.params.uploadId,
        userId: req.user._id
      });
      res.status(500).json({ message: error.message });
    }
  },

  async deleteUpload(req, res) {
    try {
      const result = await fileUploadService.deleteUpload(
        req.params.uploadId,
        req.user._id
      );
      res.json(result);
    } catch (error) {
      loggerService.logError(error, {
        context: 'deleteUpload',
        uploadId: req.params.uploadId,
        userId: req.user._id
      });
      res.status(400).json({ message: error.message });
    }
  }
}; 