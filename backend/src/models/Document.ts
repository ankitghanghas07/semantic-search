import { Pool } from 'pg';
import { pool } from '../config/database';

export interface DocumentRow {
  id: string;
  user_id: string;
  filename: string;
  s3_path: string;
  status: 'processing' | 'ready' | 'failed';
  uploaded_at?: string;
  ready_at?: string | null;
  num_chunks?: number | null;
  error_message?: string | null;
}

export const createDocumentsTable = async (): Promise<void> => {
  const sql = `
  CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    filename TEXT NOT NULL,
    s3_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ready_at TIMESTAMPTZ,
    num_chunks INT DEFAULT 0,
    error_message TEXT
  );`;
  await pool.query(sql);
};

export const insertDocument = async (
  userId: string,
  filename: string,
  s3Path: string
): Promise<DocumentRow> => {
  const result = await pool.query(
    `INSERT INTO documents (user_id, filename, s3_path, status)
     VALUES ($1, $2, $3, 'processing')
     RETURNING *`,
    [userId, filename, s3Path]
  );
  return result.rows[0];
};

export const updateDocumentStatus = async (
  documentId: string,
  status: 'processing' | 'ready' | 'failed',
  updates: { ready_at?: string | null; num_chunks?: number; error_message?: string | null } = {}
): Promise<void> => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  fields.push(`status = $${idx++}`);
  values.push(status);

  if (updates.ready_at !== undefined) {
    fields.push(`ready_at = $${idx++}`);
    values.push(updates.ready_at);
  }
  if (updates.num_chunks !== undefined) {
    fields.push(`num_chunks = $${idx++}`);
    values.push(updates.num_chunks);
  }
  if (updates.error_message !== undefined) {
    fields.push(`error_message = $${idx++}`);
    values.push(updates.error_message);
  }

  values.push(documentId);
  const sql = `UPDATE documents SET ${fields.join(', ')} WHERE id = $${idx}`;
  await pool.query(sql, values);
};

export const getDocumentById = async (documentId: string): Promise<DocumentRow | null> => {
  const res = await pool.query(`SELECT * FROM documents WHERE id = $1`, [documentId]);
  return res.rows[0] ?? null;
};

export const listDocumentsByUser = async (userId: string): Promise<DocumentRow[]> => {
  const res = await pool.query(
    `SELECT id, filename, s3_path, status, uploaded_at, ready_at, num_chunks FROM documents WHERE user_id = $1 ORDER BY uploaded_at DESC`,
    [userId]
  );
  return res.rows;
};


export async function getDocumentsByUser(userId: string) {
  const { rows } = await pool.query(
    `
    SELECT 
      id,
      filename,
      status,
      num_chunks,
      error_message,
      uploaded_at,
      ready_at
    FROM documents
    WHERE user_id = $1
    ORDER BY uploaded_at DESC
    `,
    [userId]
  );

  return rows;
}

export async function getDocumentByIdForUser(
  documentId: string,
  userId: string
) {
  const { rows } = await pool.query(
    `
    SELECT 
      id,
      filename,
      status,
      num_chunks,
      error_message,
      uploaded_at,
      ready_at
    FROM documents
    WHERE id = $1 AND user_id = $2
    LIMIT 1
    `,
    [documentId, userId]
  );

  return rows[0] || null;
}
