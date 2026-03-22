import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ChatResponse } from '../../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private api: ApiService) {}

  ask(query: string, documentId?: string) {
    return this.api.post<ChatResponse>('/chat', {
      query,
      documentId
    });
  }
}