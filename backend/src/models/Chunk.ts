import { log } from 'console';
import { pool } from '../config/database';

export interface DocumentChunk {
  id: string;
  document_id: string;
  user_id: string;
  chunk_index: number;
  content: string;
  embedding: number[];
}

export interface ChunkRow {
  id: string;
  document_id: string;
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
    console.log("error while saving the chunks ! ", err);
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getChunksForDocument(
  documentId: string,
  userId: string
): Promise<ChunkRow[]> {
  const res = await pool.query(
    `
    SELECT c.id, c.document_id, c.content, c.embedding
    FROM document_chunks c
    JOIN documents d ON d.id = c.document_id
    WHERE d.id = $1 AND d.user_id = $2
    `,
    [documentId, userId]
  );

  return res.rows.map((r) => ({
    ...r,
    embedding: r.embedding
  }));
}

export async function getChunksForUser(
  userId: string
): Promise<ChunkRow[]> {
  const res = await pool.query(
    `
    SELECT c.id, c.document_id, c.content, c.embedding
    FROM document_chunks c
    JOIN documents d ON d.id = c.document_id
    WHERE d.user_id = $1
    `,
    [userId]
  );

  return res.rows;
}
