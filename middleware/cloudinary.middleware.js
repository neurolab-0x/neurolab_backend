import cloudinary from '../config/cloudinary.config.js';
import { loggerService } from '../config/logger/config.js';

export const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    loggerService.info('Starting Cloudinary upload middleware', {
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw',
      folder: 'eeg_uploads',
      public_id: `${Date.now()}-${req.file.originalname.split('.')[0]}`
    });

    req.cloudinary = {
      url: result.secure_url,
      publicId: result.public_id,
      version: result.version,
      format: result.format,
      resourceType: result.resource_type
    };

    loggerService.info('Cloudinary upload successful', {
      publicId: result.public_id,
      url: result.secure_url
    });

    next();
  } catch (error) {
    loggerService.logError(error, {
      context: 'cloudinaryMiddleware',
      fileName: req.file?.originalname
    });
    next(error);
  }
}; 