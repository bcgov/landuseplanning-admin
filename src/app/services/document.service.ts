import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { of } from 'rxjs';

import { ApiService } from './api';
import { Document } from 'app/models/document';

@Injectable()
export class DocumentService {
  private document: Document = null;

  constructor(private api: ApiService) { }

  // get all documents for the specified application id
  getAllByApplicationId(id: string): Observable<Document[]> {
    return this.api.getDocumentsByAppId(id)
      .catch(this.api.handleError);
  }

  // get all documents for the specified comment id
  getAllByCommentId(commentId: string): Observable<Document[]> {
    return this.api.getDocumentsByCommentId(commentId)
      .catch(this.api.handleError);
  }

  // get all documents for the specified decision id
  getAllByDecisionId(decisionId: string): Observable<Document[]> {
    return this.api.getDocumentsByDecisionId(decisionId)
      .catch(this.api.handleError);
  }

  // get a specific document by its id
  getById(documentId: string, forceReload: boolean = false): Observable<Document> {
    if (this.document && this.document._id === documentId && !forceReload) {
      return of(this.document);
    }

    return this.api.getDocument(documentId)
      .map(res => {
        // return the first (only) document
        return new Document(res[0]);
      })
      .map((document: Document) => {
        if (!document) { return null as Document; }

        this.document = document;
        return this.document;
      })
      .catch(this.api.handleError);
  }

  add(formData: FormData): Observable<Document> {
    return this.api.uploadDocument(formData)
      .catch(this.api.handleError);
  }

  delete(document: Document): Observable<Document> {
    return this.api.deleteDocument(document)
      .catch(this.api.handleError);
  }

  publish(document: Document): Observable<Document> {
    return this.api.publishDocument(document)
      .catch(this.api.handleError);
  }

  unPublish(document: Document): Observable<Document> {
    return this.api.unPublishDocument(document)
      .catch(this.api.handleError);
  }
}
