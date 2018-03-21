import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';

import { ApiService } from './api';
import { Document } from 'app/models/document';

@Injectable()
export class DocumentService {
  private document: Document = null;

  constructor(private api: ApiService) { }

  // get all documents for the specified application id
  getAllByApplicationId(id: string): Observable<Document[]> {
    return this.api.getDocumentsByAppId(id)
      .map(res => {
        const documents = res.text() ? res.json() : [];
        documents.forEach((document, index) => {
          documents[index] = new Document(document);
        });
        return documents;
      })
      .catch(this.api.handleError);
  }

  // get all documents for the specified comment id
  getAllByCommentId(commentId: string): Observable<Document[]> {
    return this.api.getDocumentsByCommentId(commentId)
      .map(res => {
        const documents = res.text() ? res.json() : [];
        documents.forEach((document, i) => {
          documents[i] = new Document(document);
        });
        return documents;
      })
      .catch(this.api.handleError);
  }

  // get all documents for the specified decision id
  getAllByDecisionId(decisionId: string): Observable<Document[]> {
    return this.api.getDocumentsByDecisionId(decisionId)
      .map(res => {
        const documents = res.text() ? res.json() : [];
        documents.forEach((document, i) => {
          documents[i] = new Document(document);
        });
        return documents;
      })
      .catch(this.api.handleError);
  }

  // get a specific document by its id
  getById(documentId: string, forceReload: boolean = false): Observable<Document> {
    if (this.document && this.document._id === documentId && !forceReload) {
      return Observable.of(this.document);
    }

    return this.api.getDocument(documentId)
      .map(res => {
        const document = res.text() ? res.json() : [];
        // return the first (only) document
        return document.length > 0 ? new Document(document[0]) : null;
      })
      .map((document: Document) => {
        if (!document) { return null as Document; }

        this.document = document;
        return this.document;
      })
      .catch(this.api.handleError);
  }

  delete(file: any): Observable<any> {
    return this.api.deleteDocument(file)
      .map(res => { return res; })
      .catch(this.api.handleError);
  }

  publish(document: Document): Subscription {
    return this.api.publishDocument(document)
      .subscribe(
        () => document.isPublished = true,
        error => console.log('publish error =', error)
      );
  }

  unPublish(document: Document): Subscription {
    return this.api.unPublishDocument(document)
      .subscribe(
        () => document.isPublished = false,
        error => console.log('unpublish error =', error)
      );
  }
}
