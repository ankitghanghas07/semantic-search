// src/jobs/workers/ingestion.worker.ts
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import path from 'path';
import { getDocumentById, updateDocumentStatus } from '../../models/Document';
import {PDFParse} from 'pdf-parse';
import { embedTexts } from '../../api/services/embedding.service';
import { saveChunks } from '../../api/services/chunk.service';
import { ingestionQueue } from '../queues/ingestion.queue';
import { verifyJobPayload } from '../../utils/jobSigning';
import { log } from 'console';
import { storageService } from '../../utils/storage.service';

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

    const newStart = end - overlap;
    if (newStart <= start) {
      break; 
    }
    start = newStart;
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

      const { documentId, signature } = job.data;
      // Verify job signature
      if (!signature || !verifyJobPayload({ documentId }, signature)) {
        throw new Error('Invalid or missing job signature');
      }
      console.log(`[ingestion.worker] Processing document ${documentId}`);

      const doc = await getDocumentById(documentId);
      if (!doc) {
        throw new Error(`Document ${documentId} not found`);
      }

      // console.log(`inside doc worker, processing doc ${doc}`);

      try {

        // Use storageService to read file
        const filePath = doc.s3_path;
        log("doc file path : ", filePath);
        const ext = path.extname(filePath).toLowerCase();

        let text = '';
        const fileBuffer = await storageService.readFile(filePath);
        if (ext === '.pdf') {
          log("entered pdf parser ");
          const parser = new PDFParse({ data: fileBuffer });
          const pdfData = await parser.getText();
          text = pdfData.text;
          log("exiting pdf parser. ");
        } else {
          // treat as plain text
          text = fileBuffer.toString('utf-8');
        }

        console.log("document text : ", text);

        // chunk
        const chunks = chunkText(text, 1000, 200);
        console.log(`[ingestion.worker] split into ${chunks.length} chunks`);

        let embeddings: number[][] = [];
        try{
          embeddings = await embedTexts(chunks);
        }
        catch(error){
          log("failed to generate embeddings ", error);
          throw new Error("Failed to generated embeddings");
        }
        
        // persist chunks + embeddings
        await saveChunks(documentId, doc.user_id, chunks, embeddings);

        // update document status
        await updateDocumentStatus(documentId, 'completed', {
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


