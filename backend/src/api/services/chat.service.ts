// src/api/services/chat.service.ts
import { semanticSearch } from "./search.service";
import { buildRagPrompt } from "../../utils/prompts/rag.prompt";
import { generateGeminiJSON } from "./gemini-chat.service";

const SIMILARITY_THRESHOLD = 0.6;
const DEFAULT_TOP_K = 5;

interface ChatInput {
  userId: string;
  query: string;
  documentId?: string;
  topK?: number;
}

interface LLMResponse {
  answer: string;
  citations: number[]; // chunk indexes
}

function normalizeCitations(
  citations: number[],
  maxSources: number
): number[] {
  return [...new Set(citations)]
    .filter(
      (c) =>
        Number.isInteger(c) &&
        c >= 1 &&
        c <= maxSources
    );
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 250);
}

export const chatService = {
  async handleChat(input: ChatInput) {
    const { userId, query, documentId } = input;
    const topK = input.topK ?? DEFAULT_TOP_K;

    const searchResults = await semanticSearch(userId, query, documentId, topK);

    
    if (
      searchResults.length === 0 ||
      searchResults[0].score < SIMILARITY_THRESHOLD
    ) {
      return {
        answer: "I don't know based on the provided documents.",
        citations: [],
      };
    }
    
    const uniqueResults = Array.from(
      new Map(searchResults.map(r => [r.content, r])).values()
    );

    const prompt = buildRagPrompt(query, uniqueResults);
    const llmResponse = await generateGeminiJSON<LLMResponse>(prompt);

    if (
      llmResponse.answer !== "I don't know" &&
      llmResponse.citations.length === 0
    ) {
      return {
        answer: "I don't know",
        citations: [],
      };
    }

    const normalizedCitations = normalizeCitations(
      llmResponse.citations,
      searchResults.length
    );

    if (normalizedCitations.length === 0) {
      return {
        answer: llmResponse.answer,
        citations: [],
      };
    }

    const sources = normalizedCitations.map((sourceNumber) => {
      const chunk = searchResults[sourceNumber - 1];
      return {
        chunkId: chunk.chunkId,
        documentId: chunk.documentId,
        snippet: cleanText(chunk.content),
        score: chunk.score,
      };
    });

    return {
      answer : llmResponse.answer,
      citations: sources,
    };
  },
};
