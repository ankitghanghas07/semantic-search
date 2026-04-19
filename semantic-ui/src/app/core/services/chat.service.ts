
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = inject(ApiService);

  chat(query: string, documentId?: string, topK = 5) {
    const body: Record<string, unknown> = { query, topK };
    if (documentId) body['documentId'] = documentId;

    return this.api.post<any>('/chat', body).pipe(
      map(res => ({
        response: res.answer,
        sources: (res.citations ?? []).map((c: any) => ({
          chunkId: c.chunkId,
          documentId: c.documentId,
          text: c.snippet,
          score: c.score,
        }))
      }))
    );
  }

  search(documentId: string, query: string, topK = 5) {
    return this.api.post<any>(`/documents/${documentId}/search`, { query, topK });
  }
}