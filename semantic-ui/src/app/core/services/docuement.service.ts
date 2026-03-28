import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Document } from '../../models/document.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentService {

  constructor(private api: ApiService) {}

  getDocuments(): Observable<{ documents: Document[] }> {
    return this.api.get('/documents');
  }

  uploadDocument(file: File): Observable<{ documentId: string; status: string }> {
    return this.api.upload('/documents/upload', file);
  }
}