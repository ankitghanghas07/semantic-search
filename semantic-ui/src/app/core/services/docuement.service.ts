import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Document, DocumentListResponse, UploadResponse, QueueStats } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);

  getDocuments() {
    return this.http.get<DocumentListResponse>('/api/documents').pipe(map(r => r.documents));
  }

  getDocument(id: string) {
    return this.http.get<Document>(`/api/documents/${id}`);
  }

  uploadDocument(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<UploadResponse>('/api/documents/upload', fd);
  }

  getQueueStats() {
    return this.http.get<QueueStats>('/api/queue/stats');
  }
}