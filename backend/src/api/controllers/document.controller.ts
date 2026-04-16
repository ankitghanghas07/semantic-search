// src/controllers/document.controller.ts
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { insertDocument, listDocumentsByUser, getDocumentByIdForUser } from '../../models/Document';
import { ingestionQueue } from '../../jobs/queues/ingestion.queue';
import { signJobPayload } from '../../utils/jobSigning';
import { log } from 'console';
import { storageService } from '../../utils/storage.service';

// ensure uploads dir exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');

async function ensureUploadsDir() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(path.join(uploadsDir, 'tmp_uploads'), { recursive: true });
  } catch (e) {
    // ignore
  }
}

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ message: 'File is required (field name: file)' });
    }

    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // console.log("upload document by user: ", user);
    

    // Validate size BEFORE moving
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      await fs.unlink(file.path); // cleanup temp file
      return res.status(400).json({ message: `File too large: ${file.size} bytes` });
    }

    await ensureUploadsDir();

    const { v4: uuidv4 } = await import('uuid');
    const documentId = uuidv4();
    const filename = file.originalname;
    const storedPath = storageService.resolvePath(filename, documentId);

    // Move from multer temp location to storage
    await storageService.moveFile(file.path, storedPath);

    // Store the storage path in DB
    const inserted = await insertDocument(user.userId, filename, storedPath);
    // log("inserted document : ", inserted);

    // enqueue ingestion job with signature
    const jobPayload = { documentId: inserted.id };
    const signature = signJobPayload(jobPayload);
    await ingestionQueue.add('ingest-document', { ...jobPayload, signature }, 
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    );

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
    // console.log("documents requested by user: ", user);

    const docs = await listDocumentsByUser(user.userId);
    return res.json({ documents: docs });
  } catch (err: any) {
    console.error('[getDocuments] error', err);
    return res.status(500).json({ message: err.message ?? 'Failed to list documents' });
  }
};

export async function getDocument(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const documentId = req.params.id;

  const document = await getDocumentByIdForUser(documentId, userId);

  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  res.json(document);
}

