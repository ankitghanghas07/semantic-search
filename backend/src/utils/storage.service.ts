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
    const signedUrl = cloudinary.url(storedPath, {
      resource_type: 'raw',
      type: 'upload',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 60, // valid for 60 seconds
    });

    const response = await fetch(signedUrl);
    if (!response.ok) {
      throw new Error(`Cloudinary fetch failed: ${response.status} ${response.statusText}`);
    }
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