import cloudinary from '../config/cloudinary.config.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'neurolab/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 500, height: 500, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Upload single image middleware
export const uploadAvatar = upload.single('profilePicture');

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};

// Get image URL from Cloudinary response
export const getImageUrl = (cloudinaryResponse) => {
  return cloudinaryResponse.secure_url;
};

// Error handling middleware for upload errors
export const handleUploadError = (error, req, res, next) => {
  console.log(error);
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File size too large. Maximum size is 5MB'
      });
    }
    console.log(error)
    return res.status(400).json({
      message: 'Error uploading file',
      error: error
    });
  }
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      message: error.message
    });
  }
  next(error);
};
