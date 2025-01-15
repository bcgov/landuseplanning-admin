import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { ExternalLink } from 'app/models/externalLink';

@Injectable()
export class LinkService {
  constructor(private api: ApiService) { }

  /**
   * Get multiple external links by their ids.
   *
   * @param {Array} ids The document IDs to get with.
   * @returns {Observable}
   */
  getByMultiId(ids: Array<String>): Observable<Array<Document>> {
    return this.api.getExternalLinksByMultiId(ids)
      .map(res => {
        if (res && res.length > 0) {
          let exLinks = [];
          res.forEach(exl => {
            exLinks.push(new ExternalLink(exl));
          });
          return exLinks;
        }
        return null;
      })
      .catch(error => this.api.handleError(error));
  }

  /**
   * Get a specific link by its id. Return only the first link if multiple somehow come back.
   *
   * @param {string} exLinkId The link ID to get with.
   * @returns {Observable}
   */
  getById(exLinkId: string): Observable<ExternalLink> {
    return this.api.getLink(exLinkId).pipe(
      map(res => {
        if (res) {
          // return the first (only) link
          return res[0];
        }
        return null;
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  /**
   * Get all links from a single project.
   *
   * @param {string} currentProjectId The project to get links for.
   * @returns {Observable}
   */
  public getAll(currentProjectId: string): Observable<ExternalLink[]> {
    return this.api.getLinks(currentProjectId)
      .map((res: any) => {
        if (!res || res.length === 0) {
          return [];
        } else {
          return res.map(link => new ExternalLink(link));
          }
      })
      .catch(error => this.api.handleError(error));
  }

  /**
   * Add a new link.
   *
   * @param {FormData} formData The form data to add an external link with.
   * @returns {Observable}
   */
  add(formData: FormData): Observable<ExternalLink> {
    return this.api.addLink(formData).pipe(catchError(error => this.api.handleError(error)));
  }

  /**
   * Update a link.
   *
   * @param {FormData} formData The form data to update a link with.
   * @param {any} _id The link ID to update.
   * @returns {Observable}
   */
  update(formData: FormData, _id: any): Observable<ExternalLink> {
    return this.api.updateLink(formData, _id)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Delete a link.
   *
   * @param {ExternalLink} link The link to delete.
   * @returns {Observable}
   */
  delete(link: ExternalLink): Observable<ExternalLink> {
    return this.api.deleteLink(link).pipe(catchError(error => this.api.handleError(error)));
  }

  /**
   * Publish a link by toggling its visibility for "public" app users.
   *
   * @param {string} exLinkId The document ID to publish with.
   * @returns {Observable}
   */
  publish(exLinkId: string): Observable<ExternalLink> {
    return this.api.publishLink(exLinkId)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Unpublish a link by toggling its visibility for "public" app users.
   *
   * @param {string} exLinkId The link ID to unpublish with.
   * @returns {Observable}
   */
  unPublish(exLinkId: string): Observable<ExternalLink> {
    return this.api.unPublishLink(exLinkId)
      .catch(error => this.api.handleError(error));
  }
}
