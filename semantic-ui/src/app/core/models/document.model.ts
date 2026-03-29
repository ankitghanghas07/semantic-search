export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Document {
  id: string;
  filename: string;
  status: DocumentStatus;
  created_at: string;
}

export interface DocumentListResponse { documents: Document[]; }
export interface UploadResponse { documentId: string; status: DocumentStatus; }

export interface QueueStats {
  queueName: string;
  stats: { wait: number; completed: number; failed: number; active: number; delayed: number; };
}