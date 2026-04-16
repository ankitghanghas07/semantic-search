import path from 'path';
import fs from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary';

const STORAGE_BACKEND = process.env.STORAGE_BACKEND || 'local';
const uploadsDir = path.resolve(process.cwd(), 'uploads');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storageService = {
  resolvePath(filename: string, documentId: string): string {
    if (STORAGE_BACKEND === 's3') {
      return `documents/${documentId}/${filename}`;
    }
    return path.join(uploadsDir, `${documentId}-${filename}`);
  },

  async readFile(storedPath: string): Promise<Buffer> {
    if (STORAGE_BACKEND === 's3') {
      // storedPath is the cloudinary public_id stored in db
      const result = await cloudinary.api.resource(storedPath, { resource_type: 'raw' });
      const response = await fetch(result.secure_url);
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
    return fs.readFile(storedPath);
  },

  async moveFile(tempPath: string, storedPath: string): Promise<void> {
    if (STORAGE_BACKEND === 's3') {
      await cloudinary.uploader.upload(tempPath, {
        public_id: storedPath,
        resource_type: 'raw',  // critical — PDFs are not images
        overwrite: true,
      });
      await fs.unlink(tempPath); // delete temp file after upload
      return;
    }
    await fs.rename(tempPath, storedPath);
  }
};