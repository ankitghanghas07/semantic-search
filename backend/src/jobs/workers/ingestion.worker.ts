import { Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../../config';

export const connection = new IORedis(config.redisUrl);

export const ingestionWorker = new Worker(
  'ingestion',
  async job => {
    console.log('Processing ingestion job:', job.data);
    // Simulate async work
    await new Promise(res => setTimeout(res, 1000));
    console.log('Job done:', job.id);
  },
  { connection }
);

const queueEvents = new QueueEvents('ingestion', { connection });
queueEvents.on('completed', ({ jobId }) => {
  console.log(`Job ${jobId} completed`);
});
queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed: ${failedReason}`);
});
