import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentService } from '../../core/services/docuement.service';
import { Document, DocumentStatus, QueueStats } from '../../core/models/document.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private docSvc = inject(DocumentService);
  private router = inject(Router);

  docs        = signal<Document[]>([]);
  loading     = signal(true);
  uploading   = signal(false);
  uploadError = signal('');
  isDragOver  = signal(false);
  queueStats  = signal<QueueStats | null>(null);

  ngOnInit() { this.load(); this.loadQueue(); }

  load() {
    this.loading.set(true);
    this.docSvc.getDocuments().subscribe({
      next: d => { this.docs.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadQueue() {
    this.docSvc.getQueueStats().subscribe({ next: s => this.queueStats.set(s), error: () => {} });
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragOver.set(true); }
  onDragLeave()            { this.isDragOver.set(false); }
  onDrop(e: DragEvent)     { e.preventDefault(); this.isDragOver.set(false); const f = e.dataTransfer?.files[0]; if (f) this.upload(f); }
  onFile(e: Event)         { const f = (e.target as HTMLInputElement).files?.[0]; if (f) this.upload(f); }

  upload(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) { this.uploadError.set('Only PDF files are supported.'); return; }
    this.uploading.set(true); this.uploadError.set('');
    this.docSvc.uploadDocument(file).subscribe({
      next: () => { this.uploading.set(false); this.load(); },
      error: () => { this.uploadError.set('Upload failed. Try again.'); this.uploading.set(false); }
    });
  }

  openChat(doc: Document) { if (doc.status === 'completed') this.router.navigate(['/chat', doc.id]); }

  fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}