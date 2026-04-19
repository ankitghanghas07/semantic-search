
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { Document, DocumentListResponse, UploadResponse, QueueStats } from '../models/document.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private api = inject(ApiService);

  getDocuments() {
    return this.api.get<DocumentListResponse>('/documents').pipe(map(r => r.documents));
  }

  getDocument(id: string) {
    return this.api.get<Document>(`/documents/${id}`);
  }

  uploadDocument(file: File) {
    return this.api.upload<UploadResponse>('/documents/upload', file);
  }

  getQueueStats() {
    return this.api.get<QueueStats>('/queue/stats');
  }
}