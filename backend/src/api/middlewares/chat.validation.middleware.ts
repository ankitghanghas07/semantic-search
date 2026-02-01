// src/api/middlewares/chat.validation.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const validateChatRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { query, topK } = req.body;
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  if (query.length > 1000) {
    return res.status(400).json({ error: 'Query too long' });
  }
  
  if (topK && (topK < 1 || topK > 20)) {
    return res.status(400).json({ error: 'topK must be between 1 and 20' });
  }
  
  next();
};