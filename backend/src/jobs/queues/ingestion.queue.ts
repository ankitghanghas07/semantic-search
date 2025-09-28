import { Queue } from 'bullmq';
import { config } from '../../config';
import { connection } from '../workers/ingestion.worker';

export const ingestionQueue = new Queue('ingestion', {
  connection,
});

// Example enqueue function
export const enqueueIngestionJob = async (data: any) => {
  await ingestionQueue.add('ingest', data);
  console.log('Job enqueued:', data);
};
