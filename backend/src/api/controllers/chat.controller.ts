// src/api/controllers/chat.controller.ts
import { Request, Response } from 'express';
import { log } from "console";
import { chatService } from "../services/chat.service";
// chat.controller.ts
export async function chat(req : Request, res : Response) {
  const userId = (req as any).user.userId;
  const { query, documentId, topK } = req.body;

  // log(`query : ${query} user id : ${userId} document id : ${documentId}, topK ${topK}`);

  const response = await chatService.handleChat({
    userId,
    query,
    documentId, // optional
    topK,
  });

  res.json(response);
}
