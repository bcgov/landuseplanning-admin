import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { DocumentSection } from 'app/models/documentSection';

@Injectable()
export class DocumentSectionService {
  constructor(private api: ApiService) {}

  /**
   * Get all document sections on a single project. Get the raw response data and return it
   * as DocumentSections objects.
   *
   * @param {string} currentProjectId The project to get sections for.
   * @returns {Observable}
   */
    public getAll(currentProjectId: string): Observable<Object> {
      let documentSections = [];
      return this.api.getDocumentSections(currentProjectId)
        .map((res: any) => {
          let response = {};
          if (res) {
            res.forEach(section => documentSections.push(new DocumentSection(section)));
            response = documentSections;
          }
          return response;
        })
        .catch(error => this.api.handleError(error));
    }

    /**
     * Add a new document section.
     *
     * @param {DocumentSection} documentSection New document section object to add.
     * @returns {Observable}
     */
    add(documentSection: DocumentSection): Observable<DocumentSection> {
      return this.api.addDocumentSection(documentSection)
        .catch(error => this.api.handleError(error));
    }

    /**
     * Save a document section.
     *
     * @param {DocumentSection} documentSection New document section object to save.
     * @returns {Observable}
     */
    save(documentSection: DocumentSection): Observable<DocumentSection> {
      return this.api.saveDocumentSection(documentSection)
        .catch(error => this.api.handleError(error));
    }

}
