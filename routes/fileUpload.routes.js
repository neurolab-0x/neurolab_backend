import express from 'express';
import multer from 'multer';
import { fileUploadController } from '../controllers/fileUpload.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadToCloudinary } from '../middleware/cloudinary.middleware.js';

const fileUploadRouter = express.Router();

// Configure multer for temporary storage
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'temp/');
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only EEG-related file types
    const allowedTypes = ['.eeg', '.csv', '.edf', '.bdf'];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only EEG, CSV, EDF, and BDF files are allowed.'));
    }
  }
});

// Apply authentication middleware to all routes
fileUploadRouter.use(authenticate);

// File upload routes
fileUploadRouter.post('/upload',
  upload.single('file'),
  uploadToCloudinary,
  fileUploadController.uploadFile
);
fileUploadRouter.get('/', fileUploadController.getUserUploads);
fileUploadRouter.get('/:uploadId', fileUploadController.getUploadStatus);
fileUploadRouter.delete('/:uploadId', fileUploadController.deleteUpload);

export default fileUploadRouter; 