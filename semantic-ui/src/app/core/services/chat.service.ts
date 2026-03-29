import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChatResponse } from '../models/chat.model'; // add SearchResponse to chat.model if needed

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);

  chat(query: string, documentId?: string, topK = 5) {
    const body: Record<string, unknown> = { query, topK };
    if (documentId) body['documentId'] = documentId;
    return this.http.post<ChatResponse>('/api/chat', body);
  }

  search(documentId: string, query: string, topK = 5) {
    return this.http.post<any>(`/api/documents/${documentId}/search`, { query, topK });
  }
}