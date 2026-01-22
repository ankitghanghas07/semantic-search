import { pool } from '../config/database';

export interface DocumentChunk {
  id: string;
  document_id: string;
  user_id: string;
  chunk_index: number;
  content: string;
  embedding: number[];
}

export async function insertChunks(
  documentId: string,
  userId: string,
  chunks: string[],
  embeddings : number[][]
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (let i = 0; i < chunks.length; i++) {
      const content= chunks[i];
      const embedding = embeddings[i];

      await client.query(
        `
        INSERT INTO document_chunks
        (document_id, user_id, chunk_index, content, embedding)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [documentId, userId, i, content, JSON.stringify(embedding)]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
