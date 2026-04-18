import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Document, DocumentListResponse, UploadResponse, QueueStats } from '../models/document.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getDocuments() {
    return this.http.get<DocumentListResponse>(`${this.baseUrl}/api/documents`).pipe(map(r => r.documents));
  }

  getDocument(id: string) {
    return this.http.get<Document>(`${this.baseUrl}/api/documents/${id}`);
  }

  uploadDocument(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<UploadResponse>(`${this.baseUrl}/api/documents/upload`, fd);
  }

  getQueueStats() {
    return this.http.get<QueueStats>(`${this.baseUrl}/api/queue/stats`);
  }
}