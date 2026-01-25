// src/api/controllers/chat.controller.ts
import { chatService } from "../services/chat.service";
// chat.controller.ts
export async function chatController(req, res) {
  const userId = req.user.id;
  const { query, documentId, topK } = req.body;

  const response = await chatService.handleChat({
    userId,
    query,
    documentId, // optional
    topK,
  });

  res.json(response);
}
