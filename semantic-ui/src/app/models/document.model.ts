export interface Document {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed';
  created_at: string;
}