import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as _ from 'lodash';

import { ApiService } from './api';
import { CommentPeriod } from 'app/models/commentperiod';

@Injectable()
export class CommentPeriodService {
  // statuses
  readonly NOT_STARTED = 'NS';
  readonly NOT_OPEN = 'NO';
  readonly CLOSED = 'CL';
  readonly OPEN = 'OP';

  constructor(private api: ApiService) {}

  // get all comment periods for the specified application id
  getAllByApplicationId(appId: string): Observable<CommentPeriod[]> {
    return this.api.getPeriodsByAppId(appId).pipe(
      map(res => {
        if (res && res.length > 0) {
          const periods: CommentPeriod[] = [];
          res.forEach(cp => {
            periods.push(new CommentPeriod(cp));
          });
          return periods;
        }
        return [];
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  // get a specific comment period by its id
  getById(periodId: string): Observable<CommentPeriod> {
    return this.api.getPeriod(periodId).pipe(
      map(res => {
        if (res && res.length > 0) {
          // return the first (only) comment period
          return new CommentPeriod(res[0]);
        }
        return null;
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  add(orig: CommentPeriod): Observable<CommentPeriod> {
    // make a (deep) copy of the passed-in comment period so we don't change it
    const period = _.cloneDeep(orig);

    // ID must not exist on POST
    delete period._id;

    return this.api.addCommentPeriod(period).pipe(catchError(error => this.api.handleError(error)));
  }

  save(orig: CommentPeriod): Observable<CommentPeriod> {
    // make a (deep) copy of the passed-in comment period so we don't change it
    const period = _.cloneDeep(orig);

    return this.api.saveCommentPeriod(period).pipe(catchError(error => this.api.handleError(error)));
  }

  delete(period: CommentPeriod): Observable<CommentPeriod> {
    return this.api.deleteCommentPeriod(period).pipe(catchError(error => this.api.handleError(error)));
  }

  publish(period: CommentPeriod): Observable<CommentPeriod> {
    return this.api.publishCommentPeriod(period).pipe(catchError(error => this.api.handleError(error)));
  }

  unPublish(period: CommentPeriod): Observable<CommentPeriod> {
    return this.api.unPublishCommentPeriod(period).pipe(catchError(error => this.api.handleError(error)));
  }

  // returns first period
  // multiple comment periods are currently not supported
  getCurrent(periods: CommentPeriod[]): CommentPeriod {
    return periods.length > 0 ? periods[0] : null;
  }

  /**
   * Given a comment period, returns status code.
   */
  getStatusCode(period: CommentPeriod): string {
    if (!period || !period.startDate || !period.endDate) {
      return this.NOT_OPEN;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);

    if (endDate < today) {
      return this.CLOSED;
    } else if (startDate > today) {
      return this.NOT_STARTED;
    } else {
      return this.OPEN;
    }
  }

  isNotStarted(statusCode: string): boolean {
    return statusCode === this.NOT_STARTED;
  }

  isNotOpen(statusCode: string): boolean {
    return statusCode === this.NOT_OPEN;
  }

  isClosed(statusCode: string): boolean {
    return statusCode === this.CLOSED;
  }

  isOpen(statusCode: string): boolean {
    return statusCode === this.OPEN;
  }

  /**
   * Given a status code, returns a user-friendly status string.
   */
  getStatusString(statusCode: string): string {
    if (statusCode) {
      switch (statusCode) {
        case this.NOT_STARTED:
          return 'Commenting Not Started';
        case this.NOT_OPEN:
          return 'Not Open For Commenting';
        case this.CLOSED:
          return 'Commenting Closed';
        case this.OPEN:
          return 'Commenting Open';
      }
    }
    return null;
  }
}
