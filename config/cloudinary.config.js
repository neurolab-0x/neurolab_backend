import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Check if environment variables are loaded
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary credentials in environment variables:');
  console.error('CLOUDINARY_CLOUD_NAME:', cloudName ? '✓' : '✗');
  console.error('CLOUDINARY_API_KEY:', apiKey ? '✓' : '✗');
  console.error('CLOUDINARY_API_SECRET:', apiSecret ? '✓' : '✗');
  throw new Error('Missing required Cloudinary credentials');
}

cloudinary.v2.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

export default cloudinary.v2;