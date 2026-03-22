export interface Citation {
  ref: string;
  chunkId: string;
  documentId: string;
  snippet: string;
  score: number;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
}