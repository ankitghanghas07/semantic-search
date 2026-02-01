import { Router } from 'express';
import { chat } from '../controllers/chat.controller';
import { validateChatRequest } from '../middlewares/chat.validation.middleware';

const router = Router();

router.post('/', validateChatRequest, chat);

export default router;
