import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { flatMap, mergeMap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { EmailSubscribe } from 'app/models/emailSubscribe';

@Injectable()
export class EmailSubscribeService {

  private emailSubscribers: EmailSubscribe;

  constructor(
    private api: ApiService,
  ) { }

  /**
   * Get all email subscribers on a single project. Get the raw response data and return it
   * as Email Subscribe objects.
   *
   * @param {string} currentProjectId The project to get subscribers for.
   * @returns {Observable}
   */
  public getAll(currentProjectId: string): Observable<Object> {
    let emailSubscribe = [];
    return this.api.getEmails(currentProjectId)
      .map((res: any) => {
        if (res) {
          if (!res || res.length === 0) {
            return { totalCount: 0, data: [] };
          }
          res.forEach(email => {
            emailSubscribe.push(new EmailSubscribe(email));
          });
          return { totalCount: res.length, data: emailSubscribe };
        }
        return {};
      })
      .catch(error => this.api.handleError(error));
  }

  /**
   * Remove an email subscription for a given project.
   *
   * @param {string} emailAddress The email address to remove.
   * @param {string} projectId The project to remove the subscriber for.
   * @returns {Observable}
   */
  public deleteEmail(emailAddress: string, projectId: string): Observable<Object> {
    return this.api.deleteEmail(emailAddress, projectId)
      .map((res: any) => {
        if (res) {
          return { res };
        }
        return {};
      })
      .catch(error => this.api.handleError(error));
  }

}
