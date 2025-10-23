import { Router } from 'express';
import authRoutes from './auth.routes';
import documentRoutes from './document.routes';
import queryRoutes from './query.routes';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/documents', authMiddleware, documentRoutes);
router.use('/query', authMiddleware, queryRoutes);

export default router;
