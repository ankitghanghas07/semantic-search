import { embedTexts } from './embedding.service';
import {
  getChunksForDocument,
  getChunksForUser
} from '../../models/Chunk';
import { cosineSimilarity } from '../../utils/cosineSimilarity';

export async function semanticSearch(
  userId: string,
  query: string,
  documentId?: string,
  topK = 5
) {
  // 1. Embed query (single embedding, always)
  const { embeddings, errors } = await embedTexts([query]);
  if (errors.length > 0) {
    throw new Error('Failed to generate query embedding');
  }

  const queryEmbedding = embeddings[0];

  // 2. Load chunks
  const chunks = documentId
    ? await getChunksForDocument(documentId, userId)
    : await getChunksForUser(userId);

  if (chunks.length === 0) {
    return [];
  }

  // 3. Score chunks
  const scored = chunks.map((chunk) => ({
    chunkId: chunk.id,
    documentId: chunk.document_id,
    content: chunk.content,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));

  // 4. Rank + topK
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}
