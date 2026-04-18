import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  chat(query: string, documentId?: string, topK = 5) {
    const body: Record<string, unknown> = { query, topK };
    if (documentId) body['documentId'] = documentId;

    return this.http.post<any>(`${this.baseUrl}/api/chat`, body).pipe(
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
    return this.http.post<any>(`${this.baseUrl}/api/documents/${documentId}/search`, { query, topK });
  }
}