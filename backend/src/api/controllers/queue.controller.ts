// src/api/controllers/queue.controller.ts
import { Request, Response } from 'express';
import { ingestionQueue } from '../../jobs/queues/ingestion.queue';

export const getQueueStats = async (req: Request, res: Response) => {
  try {
    const counts = await ingestionQueue.getJobCounts('wait', 'completed', 'failed', 'active', 'delayed');
    res.json({
      queueName: 'ingestionQueue',
      stats: counts,
    });
  } catch (err: any) {
    console.error('[getQueueStats] error', err);
    res.status(500).json({ message: err.message ?? 'Failed to get queue stats' });
  }
};
