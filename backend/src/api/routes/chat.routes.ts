import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { chat } from '../controllers/chat.controller';

const router = Router();

router.post("/chat", authMiddleware, chat);

export default router;
