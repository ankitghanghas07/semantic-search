import { Request, Response } from 'express';
import { semanticSearch } from '../services/search.service';

export async function searchDocument(req: Request, res: Response) {
  const userId = (req as any).user!.userId;
  const { documentId } = req.params;
  const { query, topK } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  const results = await semanticSearch(
    userId,
    documentId,
    query,
    topK ?? 5
  );

  res.json({
    query,
    results
  });
}
