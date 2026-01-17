// src/jobs/workers/ingestion.worker.ts
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import path from 'path';
import fs from 'fs/promises';
import { getDocumentById, updateDocumentStatus } from '../../models/Document';
import {PDFParse} from 'pdf-parse';
import { embedTexts } from '../../api/services/embedding.service';
import { saveChunks } from '../../api/services/chunk.service';
import { ingestionQueue } from '../queues/ingestion.queue';
import { log } from 'console';

// NOTE: Placeholder functions to be implemented with your actual embedder & Milvus
async function embedChunks(chunks: string[]): Promise<number[][]> {
  // TODO: call Gemini or local embedder here; return array of vectors
  return chunks.map(() => []);
}
async function upsertToMilvus(documentId: string, chunkTexts: string[], vectors: number[][]) {
  // TODO: upsert into Milvus (or other vector DB). Return array of milvus ids or similar.
  return chunkTexts.map((_, i) => i);
}

// simple chunker: split by paragraphs / size approx
function chunkText(text: string, maxChars = 3000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);
    // try to break at newline for nicer chunks
    const nl = text.lastIndexOf('\n', end);
    if (nl > start && nl > end - 200) {
      end = nl;
    }
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) chunks.push(chunk);
    start = end - overlap;
    if (start < 0) start = 0;
  }
  return chunks;
}

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const startIngestionWorker = async () => {
  try {
    const counts = await ingestionQueue.getJobCounts('wait', 'completed', 'failed', 'active', 'delayed');
    console.log('[ingestion.worker] Queue stats:', counts);
  } catch (err) {
    console.error('[ingestion.worker] Could not get queue stats', err);
  }
  
  const worker = new Worker(
    'ingestionQueue',
    async (job: Job) => {
      const { documentId } = job.data;
      console.log(`[ingestion.worker] Processing document ${documentId}`);

      const doc = await getDocumentById(documentId);
      if (!doc) {
        throw new Error(`Document ${documentId} not found`);
      }

      try {
        // For local dev, s3_path is file path under uploads/
        const filePath = doc.s3_path;
        log("doc file path : ", filePath);
        
        const ext = path.extname(filePath).toLowerCase();

        let text = '';
        if (ext === '.pdf') {
          const dataBuffer = await fs.readFile(filePath);
          const parser = new PDFParse({data : dataBuffer});
          const parsed = await parser.getText();
          text = parsed.text;
        } else {
          // treat as plain text
          text = await fs.readFile(filePath, 'utf-8');
        }

        // chunk
        const chunks = chunkText(text, 3000, 200);
        console.log(`[ingestion.worker] split into ${chunks.length} chunks`);

        // embed (placeholder)
        const embeddings = await embedTexts(chunks);

        // upsert into Milvus (placeholder)
        // await upsertToMilvus(documentId, chunks, vectors);

        // persist chunks + embeddings
        await saveChunks(documentId, doc.user_id, chunks, embeddings);

        // update document status
        await updateDocumentStatus(documentId, 'ready', {
          ready_at: new Date().toISOString(),
          num_chunks: chunks.length,
          error_message: null
        });

        console.log(`[ingestion.worker] finished document ${documentId}`);
        return { success: true };
      } catch (err: any) {
        console.error(`[ingestion.worker] failed document ${documentId}`, err);
        await updateDocumentStatus(documentId, 'failed', {
          error_message: err.message?.slice?.(0, 1000) ?? String(err)
        });
        throw err;
      }
    },
    { connection,
      concurrency : 2
    }
  );

  worker.on('completed', (job) => {
    console.log(`[ingestion.worker] job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[ingestion.worker] job ${job?.id} failed`, err);
  });

  console.log("*********************************");
  console.log('[ingestion.worker] Worker started');
};

process.on('SIGINT', async () => {
  console.log('[worker] shutting down');
  await connection.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Worker shutting down...');
  await connection.quit();
  process.exit(0);
});


startIngestionWorker();


