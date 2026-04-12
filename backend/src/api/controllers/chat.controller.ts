// src/api/controllers/chat.controller.ts
import { Request, Response } from 'express';
import { chatService } from "../services/chat.service";
export async function chat(req : Request, res : Response) {
  const userId = (req as any).user.userId;
  const { query, documentId, topK } = req.body;

  // console.log(`query : ${query} user id : ${userId} document id : ${documentId}, topK ${topK}`);

  const response = await chatService.handleChat({
    userId,
    query,
    documentId, // optional
    topK,
  });

  res.json(response);
}
