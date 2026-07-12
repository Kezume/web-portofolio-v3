import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export const uploadImageToCloudinary = (
  fileBuffer: Buffer,
  folder: string = 'portfolio'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // Auto-optimize: convert to WebP and apply quality optimization
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (result?.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(error ?? new Error('Cloudinary upload failed with no result.'));
        }
      }
    );

    // Use Node.js native Readable stream instead of the streamifier package
    Readable.from(fileBuffer).pipe(uploadStream);
  });
};
