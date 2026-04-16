import { log } from 'console';
import { insertChunks } from '../../models/Chunk';

export async function saveChunks(
  documentId: string,
  userId: string,
  chunks: string[],
  embeddings: number[][]
) {
  await insertChunks(documentId, userId, chunks, embeddings);
}
