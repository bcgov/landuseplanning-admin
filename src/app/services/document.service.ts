import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { Document } from 'app/models/document';

@Injectable()
export class DocumentService {
  constructor(private api: ApiService) { }

  /**
   * Get a specific document by its id. Get the raw data and return it as Document objects.
   *
   * @param {Array} ids The document IDs to get with.
   * @returns {Observable}
   */
  getByMultiId(ids: Array<String>): Observable<Array<Document>> {
    return this.api.getDocumentsByMultiId(ids)
      .map(res => {
        if (res && res.length > 0) {
          let docs = [];
          res.forEach(doc => {
            docs.push(new Document(doc));
          });
          return docs;
        }
        return null;
      })
      .catch(error => this.api.handleError(error));
  }

  /**
   * Get a specific document by its id. Return only the first document if multiple
   * somehow come back.
   *
   * @param {string} documentId The document ID to get with.
   * @returns {Observable}
   */
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

  /**
   * Add a new document.
   *
   * @param {FormData} formData The form data to add a document with.
   * @returns {Observable}
   */
  add(formData: FormData): Observable<Document> {
    return this.api.uploadDocument(formData).pipe(catchError(error => this.api.handleError(error)));
  }

  /**
   * Update a document.
   *
   * @param {FormData} formData The form data to update a document with.
   * @param {any} _id The document ID to update.
   * @returns {Observable}
   */
  update(formData: FormData, _id: any): Observable<Document> {
    return this.api.updateDocument(formData, _id)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Delete a document.
   *
   * @param {Document} document The document to delete.
   * @returns {Observable}
   */
  delete(document: Document): Observable<Document> {
    return this.api.deleteDocument(document).pipe(catchError(error => this.api.handleError(error)));
  }

  /**
   * Publish a document by toggling its visibility for "public" app users.
   *
   * @param {string} docId The document ID to publish with.
   * @returns {Observable}
   */
  publish(docId: string): Observable<Document> {
    return this.api.publishDocument(docId)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Unpublish a document by toggling its visibility for "public" app users.
   *
   * @param {string} docId The document ID to unpublish with.
   * @returns {Observable}
   */
  unPublish(docId: string): Observable<Document> {
    return this.api.unPublishDocument(docId)
      .catch(error => this.api.handleError(error));
  }
}
