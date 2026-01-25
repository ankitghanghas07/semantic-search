import { Router } from 'express';
import authRoutes from './auth.routes';
import documentRoutes from './document.routes';
import queryRoutes from './query.routes';
import queueRoutes from './queue.routes';
import searchRoutes from './search.routes'
import chatRoutes from './chat.routes';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/documents', authMiddleware, documentRoutes);
router.use('/query', authMiddleware, queryRoutes);
router.use('/queue', authMiddleware, queueRoutes);
router.use('/chat', authMiddleware, chatRoutes);
router.use('/', searchRoutes);

export default router;
