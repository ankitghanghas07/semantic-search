import { pool } from '../../config/database';

export async function saveChunks(
  documentId: string,
  userId: string,
  chunks: string[],
  embeddings: number[][]
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (let i = 0; i < chunks.length; i++) {
      await client.query(
        `
        INSERT INTO document_chunks
          (document_id, user_id, chunk_index, content, embedding)
        VALUES ($1, $2, $3, $4)
        `,
        [ documentId, userId, i, chunks[i], JSON.stringify(embeddings[i]) ]
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
