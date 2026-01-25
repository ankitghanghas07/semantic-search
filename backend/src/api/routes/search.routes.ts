import { Router } from 'express';
import { searchDocument } from '../controllers/search.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post(
  '/documents/:documentId/search',
  authMiddleware,
  searchDocument
);

export default router;
