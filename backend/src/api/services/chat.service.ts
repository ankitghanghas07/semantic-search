// src/api/services/chat.service.ts
import { semanticSearch } from "./search.service";
import { buildRagPrompt } from "../../utils/prompts/rag.prompt";
import { generateGeminiJSON } from "./gemini-chat.service";

const SIMILARITY_THRESHOLD = 0.6;
const DEFAULT_TOP_K = 5;
const MAX_PER_DOC = 2;

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

    const validResults = searchResults.filter(r => r.score >= SIMILARITY_THRESHOLD);
    if (validResults.length === 0) {
      return {
        answer: "I don't know based on the provided documents.",
        citations: [],
      };
    }
    
    // dedup
    const uniqueResults = Array.from(
      new Map(validResults.map(r => [r.content, r])).values()
    );
    const sortedResults = uniqueResults.sort((a, b) => b.score - a.score);

    // Limit and diversify
    const grouped = new Map<string, typeof sortedResults[number][]>();
    for (const r of sortedResults) {
      if (!grouped.has(r.documentId)) {
        grouped.set(r.documentId, []);
      }

      const arr = grouped.get(r.documentId);

      if (arr.length < MAX_PER_DOC) {
        arr.push(r);
      }
    }

    const flattened = Array.from(grouped.values()).flat();
    const limitedResults = flattened
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    const prompt = buildRagPrompt(query, limitedResults);

    let llmResponse: LLMResponse;

    try {
      llmResponse = await generateGeminiJSON<LLMResponse>(prompt);
    } catch (e) {
      return {
        answer: "Failed to generate response.",
        citations: [],
      };
    }

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
      limitedResults.length
    );

    if (normalizedCitations.length === 0) {
      return {
        answer: llmResponse.answer,
        citations: [],
      };
    }

    const sources = normalizedCitations.map((sourceNumber) => {
      const chunk = limitedResults[sourceNumber - 1];
      return {
        ref: `[${sourceNumber}]`,
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
