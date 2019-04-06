import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { Document } from 'app/models/document';

@Injectable()
export class DocumentService {
  private currentState: any;

  constructor(private api: ApiService) {
    this.currentState = {
    };
  }

  get state(): any { return this.currentState; }
  set state(state: any) { this.currentState[state.type] = state.data; }

  // get all documents for the specified application id
  getAllByApplicationId(id: string): Observable<Document[]> {
    return this.api.getDocumentsByAppId(id)
      .map(res => {
        if (res && res.length > 0) {
          const documents: Array<Document> = [];
          res.forEach(doc => {
            documents.push(new Document(doc));
          });
          return documents;
        }
        return [];
      })
      .catch(error => this.api.handleError(error));
  }

  // get all documents for the specified comment id
  getAllByCommentId(commentId: string): Observable<Document[]> {
    return this.api.getDocumentsByCommentId(commentId)
      .map(res => {
        if (res && res.length > 0) {
          const documents: Array<Document> = [];
          res.forEach(doc => {
            documents.push(new Document(doc));
          });
          return documents;
        }
        return [];
      })
      .catch(error => this.api.handleError(error));
  }

  // get all documents for the specified decision id
  getAllByDecisionId(decisionId: string): Observable<Document[]> {
    return this.api.getDocumentsByDecisionId(decisionId)
      .map(res => {
        if (res && res.length > 0) {
          const documents: Array<Document> = [];
          res.forEach(doc => {
            documents.push(new Document(doc));
          });
          return documents;
        }
        return [];
      })
      .catch(error => this.api.handleError(error));
  }

  // get a specific document by its id
  getById(documentId: string): Observable<Document> {
    return this.api.getDocument(documentId)
      .map(res => {
        if (res && res.length > 0) {
          // return the first (only) document
          return new Document(res[0]);
        }
        return null;
      })
      .catch(error => this.api.handleError(error));
  }

  add(formData: FormData): Observable<Document> {
    return this.api.uploadDocument(formData)
      .catch(error => this.api.handleError(error));
  }

  delete(document: Document): Observable<Document> {
    return this.api.deleteDocument(document)
      .catch(error => this.api.handleError(error));
  }

  publish(document: Document): Observable<Document> {
    return this.api.publishDocument(document)
      .catch(error => this.api.handleError(error));
  }

  unPublish(document: Document): Observable<Document> {
    return this.api.unPublishDocument(document)
      .catch(error => this.api.handleError(error));
  }

}
