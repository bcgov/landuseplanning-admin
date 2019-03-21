import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { Document } from 'app/models/document';

@Injectable()
export class DocumentService {
  constructor(private api: ApiService) {}

  // get all documents for the specified application id
  getAllByApplicationId(id: string): Observable<Document[]> {
    return this.api.getDocumentsByAppId(id).pipe(
      map(res => {
        if (res && res.length > 0) {
          const documents: Document[] = [];
          res.forEach(doc => {
            documents.push(new Document(doc));
          });
          return documents;
        }
        return [];
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  // get all documents for the specified comment id
  getAllByCommentId(commentId: string): Observable<Document[]> {
    return this.api.getDocumentsByCommentId(commentId).pipe(
      map(res => {
        if (res && res.length > 0) {
          const documents: Document[] = [];
          res.forEach(doc => {
            documents.push(new Document(doc));
          });
          return documents;
        }
        return [];
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  // get all documents for the specified decision id
  getAllByDecisionId(decisionId: string): Observable<Document[]> {
    return this.api.getDocumentsByDecisionId(decisionId).pipe(
      map(res => {
        if (res && res.length > 0) {
          const documents: Document[] = [];
          res.forEach(doc => {
            documents.push(new Document(doc));
          });
          return documents;
        }
        return [];
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  // get a specific document by its id
  getById(documentId: string): Observable<Document> {
    return this.api.getDocument(documentId).pipe(
      map(res => {
        if (res && res.length > 0) {
          // return the first (only) document
          return new Document(res[0]);
        }
        return null;
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  add(formData: FormData): Observable<Document> {
    return this.api.uploadDocument(formData).pipe(catchError(error => this.api.handleError(error)));
  }

  delete(document: Document): Observable<Document> {
    return this.api.deleteDocument(document).pipe(catchError(error => this.api.handleError(error)));
  }

  publish(document: Document): Observable<Document> {
    return this.api.publishDocument(document).pipe(catchError(error => this.api.handleError(error)));
  }

  unPublish(document: Document): Observable<Document> {
    return this.api.unPublishDocument(document).pipe(catchError(error => this.api.handleError(error)));
  }
}
