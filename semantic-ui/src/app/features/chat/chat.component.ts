import { Component, inject, signal, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { DocumentService } from '../../core/services/docuement.service';
import { ChatMessage, ChatSource, MessagePart } from '../../core/models/chat.model';
import { Document } from '../../core/models/document.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  @ViewChild('msgContainer') msgContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('textarea')     textarea!: ElementRef<HTMLTextAreaElement>;

  private chatSvc = inject(ChatService);
  private docSvc  = inject(DocumentService);
  private route   = inject(ActivatedRoute);
  private cdr     = inject(ChangeDetectorRef);

  docs         = signal<Document[]>([]);
  selectedId   = signal<string | undefined>(undefined);
  messages     = signal<ChatMessage[]>([]);
  query        = '';
  loading      = signal(false);
  error        = signal('');
  loadingDocs  = signal(true);

  /* Source panel */
  panelSources = signal<ChatSource[]>([]);
  panelOpen    = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('documentId') ?? undefined;
    this.docSvc.getDocuments().subscribe({
      next: all => {
        this.docs.set(all.filter(d => d.status === 'completed'));
        this.loadingDocs.set(false);
        if (id) this.selectedId.set(id);
      },
      error: () => this.loadingDocs.set(false)
    });
  }

  selectDoc(id: string | undefined) {
    this.selectedId.set(id);
    this.messages.set([]);
    this.panelOpen.set(false);
    this.error.set('');
  }

  send() {
    const q = this.query.trim();
    if (!q || this.loading()) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: q, timestamp: new Date() };
    const loadMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: '', timestamp: new Date(), isLoading: true };

    this.messages.update(m => [...m, userMsg, loadMsg]);
    this.query = '';
    this.resetTextarea();
    this.loading.set(true);
    this.error.set('');
    this.scrollBottom();

    this.chatSvc.chat(q, this.selectedId(), 5).subscribe({
      next: res => {
        const reply: ChatMessage = {
          id: crypto.randomUUID(), role: 'assistant',
          content: res.response, sources: res.sources, timestamp: new Date()
        };
        this.messages.update(m => [...m.slice(0, -1), reply]);
        this.loading.set(false);
        this.scrollBottom();
      },
      error: () => {
        this.messages.update(m => m.slice(0, -1));
        this.error.set('Failed to get a response. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }

  onInput(e: Event) {
    const el = e.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 128) + 'px';
  }

  resetTextarea() {
    if (this.textarea?.nativeElement) {
      this.textarea.nativeElement.style.height = 'auto';
    }
  }

  openSources(sources: ChatSource[]) { this.panelSources.set(sources); this.panelOpen.set(true); }
  closeSources() { this.panelOpen.set(false); }

  /** Parse [1], [2] markers into typed parts for template rendering */
  parseParts(text: string): MessagePart[] {
    const parts: MessagePart[] = [];
    const re = /\[(\d+)\]/g;
    let last = 0, m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push({ type: 'text', content: text.slice(last, m.index) });
      parts.push({ type: 'citation', index: parseInt(m[1]) - 1 });
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ type: 'text', content: text.slice(last) });
    return parts;
  }

  docName(id: string) { return this.docs().find(d => d.id === id)?.filename ?? id; }
  scoreLabel(s: number) { return (s * 100).toFixed(0) + '%'; }

  clearChat() { this.messages.set([]); this.panelOpen.set(false); this.error.set(''); }

  private scrollBottom() {
    setTimeout(() => {
      const el = this.msgContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);
  }
}