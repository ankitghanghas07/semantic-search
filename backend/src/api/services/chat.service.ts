// src/api/services/chat.service.ts
import { semanticSearch } from "./search.service";
import { buildRagPrompt } from "../../utils/prompts/rag.prompt";
import { generateGeminiResponse } from "./gemini-chat.service";

const SIMILARITY_THRESHOLD = 0.3;
const DEFAULT_TOP_K = 5;

interface ChatInput {
  userId: string;
  query: string;
  documentId?: string;
  topK?: number;
}

export const chatService = {
  async handleChat(input: ChatInput) {
    const { userId, query, documentId } = input;
    const topK = input.topK ?? DEFAULT_TOP_K;

    // 1. Semantic search
    const searchResults = await semanticSearch(query, userId, documentId, topK);

    if (
      searchResults.length === 0 ||
      searchResults[0].score < SIMILARITY_THRESHOLD
    ) {
      return {
        answer: "I don't know based on the provided documents.",
        sources: [],
      };
    }

    // 2. Build prompt
    const prompt = buildRagPrompt(query, searchResults);

    // 3. LLM call
    const answer = await generateGeminiResponse(prompt);

    // 4. Response shaping
    return {
      answer,
      sources: searchResults.map((r) => ({
        chunkId: r.chunkId,
        score: r.score,
      })),
    };
  },
};
