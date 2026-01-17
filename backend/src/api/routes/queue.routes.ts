// src/api/routes/queue.routes.ts
import { Router } from 'express';
import { getQueueStats } from '../controllers/queue.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', authMiddleware, getQueueStats);

export default router;
