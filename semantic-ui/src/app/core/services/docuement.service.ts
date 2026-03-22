import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Document } from '../../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {

  // In-memory mock store
  private documents: Document[] = [
    {
      id: '1',
      filename: 'Sample-Report.pdf',
      status: 'completed',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      filename: 'Financials-Q4.pdf',
      status: 'processing',
      created_at: new Date().toISOString()
    }
  ];

  getDocuments(): Observable<{ documents: Document[] }> {
    return of({ documents: this.documents }).pipe(delay(500));
  }

  uploadDocument(file: File): Observable<{ documentId: string; status: string }> {
    const newDoc: Document = {
      id: Date.now().toString(),
      filename: file.name,
      status: 'processing',
      created_at: new Date().toISOString()
    };

    // Add immediately
    this.documents = [newDoc, ...this.documents];

    // Simulate processing → completed after 3 sec
    setTimeout(() => {
      this.documents = this.documents.map(doc =>
        doc.id === newDoc.id
          ? { ...doc, status: 'completed' }
          : doc
      );
    }, 3000);

    return of({
      documentId: newDoc.id,
      status: newDoc.status
    }).pipe(delay(500));
  }
}