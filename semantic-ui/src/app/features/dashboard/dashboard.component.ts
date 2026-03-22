import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../core/services/docuement.service';
import { Document } from '../../models/document.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  documents: Document[] = [];
  loading = false;
  uploading = false;
  error = '';

  constructor(
    private docService: DocumentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchDocuments();
  }

  async fetchDocuments() {
    this.loading = true;
    this.error = '';

    try {
      const res = await firstValueFrom(this.docService.getDocuments());
      this.documents = res.documents;
    } catch (err) {
      this.error = 'Failed to load documents';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.uploading = true;
    this.error = '';

    try {
      await firstValueFrom(this.docService.uploadDocument(file));
      await this.fetchDocuments(); // refresh list
      input.value = ''; // reset file input
    } catch (err) {
      this.error = 'Upload failed';
      console.error(err);
    } finally {
      this.uploading = false;
    }
  }

  openChat(doc: Document) {
    if (doc.status !== 'completed') return;
    this.router.navigate(['/chat', doc.id]);
  }
}