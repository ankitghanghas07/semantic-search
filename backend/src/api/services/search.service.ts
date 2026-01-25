import { embedTexts } from './embedding.service';
import { getChunksForDocument } from '../../models/Chunk';
import { cosineSimilarity } from '../../utils/cosineSimilarity';

export async function semanticSearch(
  userId: string,
  documentId: string,
  query: string,
  topK = 5
) {
  // 1. Embed query
  const queryEmbeddings = await embedTexts([query]);

  // 2. Load chunks
  const chunks = await getChunksForDocument(documentId, userId);

  if (chunks.length === 0) {
    return [];
  }

  // 3. Score chunks
  const scored = chunks.map((chunk) => ({
    chunkId: chunk.id,
    content: chunk.content,
    score: cosineSimilarity(queryEmbeddings.embeddings[0], chunk.embedding)
  }));

  // 4. Rank
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}
