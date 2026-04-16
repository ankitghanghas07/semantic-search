import path from 'path';
import fs from 'fs/promises';

const STORAGE_BACKEND = process.env.STORAGE_BACKEND || 'local';
const uploadsDir = path.resolve(process.cwd(), 'uploads');

export const storageService = {
  /**
   * Returns the path or key to store in the database.
   * For local: absolute file path under /uploads
   * For S3: object key like documents/uuid/filename.pdf
   */
  resolvePath(filename: string, documentId: string): string {
    if (STORAGE_BACKEND === 's3') {
      return `documents/${documentId}/${filename}`;
    }
    return path.join(uploadsDir, `${documentId}-${filename}`);
  },

  /**
   * Returns the file contents as a Buffer.
   * For local: reads from disk.
   * For S3: replace with S3 GetObject call.
   */
  async readFile(storedPath: string): Promise<Buffer> {
    if (STORAGE_BACKEND === 's3') {
      throw new Error('S3 backend not implemented yet. Set STORAGE_BACKEND=local or implement S3 GetObject here.');
    }
    return fs.readFile(storedPath);
  },

  /**
   * Moves the uploaded temp file to its final destination.
   * For local: uses fs.rename (atomic, same volume).
   * For S3: replace with S3 PutObject call then delete temp file.
   */
  async moveFile(tempPath: string, storedPath: string): Promise<void> {
    if (STORAGE_BACKEND === 's3') {
      throw new Error('S3 backend not implemented yet.');
    }
    await fs.rename(tempPath, storedPath);
  }
};
