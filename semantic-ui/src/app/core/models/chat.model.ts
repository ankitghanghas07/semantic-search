export interface ChatResponse {
  response: string;
  sources: ChatSource[];
}

export interface ChatSource {
  chunkId: string;
  documentId: string;
  text: string;       // mapped from snippet
  score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  timestamp: Date;
  isLoading?: boolean;
}

export type MessagePart =
  | { type: 'text'; content: string }
  | { type: 'citation'; index: number };