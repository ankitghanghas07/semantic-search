// src/controllers/document.controller.ts
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { insertDocument, listDocumentsByUser } from '../../models/Document';
import { ingestionQueue } from '../../jobs/queues/ingestion.queue';

// ensure uploads dir exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');

async function ensureUploadsDir() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    // Multer will place file in req.file
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ message: 'File is required (field name: file)' });
    }

    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await ensureUploadsDir();

    const documentId = uuidv4();
    const filename = file.originalname;
    const destPath = path.join(uploadsDir, `${documentId}-${filename}`);

    // Move from multer temp location to uploads dir
    await fs.rename(file.path, destPath);

    // For now s3_path is local path; later swap with MinIO/AWS S3 URL
    const s3Path = destPath;

    const inserted = await insertDocument(user.id, filename, s3Path);

    // enqueue ingestion job
    await ingestionQueue.add('ingest-document', { documentId: inserted.id }, { attempts: 3 });

    return res.status(201).json({ documentId: inserted.id, status: inserted.status });
  } catch (err: any) {
    console.error('[uploadDocument] error', err);
    return res.status(500).json({ message: err.message ?? 'Upload failed' });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const docs = await listDocumentsByUser(user.id);
    return res.json({ documents: docs });
  } catch (err: any) {
    console.error('[getDocuments] error', err);
    return res.status(500).json({ message: err.message ?? 'Failed to list documents' });
  }
};
