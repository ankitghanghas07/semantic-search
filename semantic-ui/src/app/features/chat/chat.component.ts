import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ChatResponse } from '../../models/chat.model';

interface Message {
  role: 'user' | 'bot';
  content: string;
  citations?: ChatResponse['citations'];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  documentId!: string;

  messages: Message[] = [];
  query = '';
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.documentId = this.route.snapshot.paramMap.get('documentId')!;
  }

  async sendMessage() {
    if (!this.query.trim() || this.loading) return;

    const userMessage: Message = {
      role: 'user',
      content: this.query
    };

    this.messages.push(userMessage);

    const currentQuery = this.query;
    this.query = '';
    this.loading = true;
    this.error = '';

    try {
      const res = await firstValueFrom(
        this.chatService.ask(currentQuery, this.documentId)
      );

      const botMessage: Message = {
        role: 'bot',
        content: res.answer,
        citations: res.citations
      };

      this.messages.push(botMessage);

    } catch (err) {
      this.error = 'Failed to get response';
    } finally {
      this.loading = false;
    }
  }
}