import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { CommentPeriod } from 'app/models/commentPeriod';
import { CommentPeriodSummary } from 'app/models/commentPeriodSummary';

@Injectable()
export class CommentPeriodService {

  // statuses (also used as short strings)
  readonly NOT_STARTED = 'Not Started';
  readonly NOT_OPEN = 'Not Open';
  readonly CLOSED = 'Closed';
  readonly OPEN = 'Open';

  // use helpers to get these:
  private commentStatuses = [];

  constructor(private api: ApiService) {
    // user-friendly strings
    this.commentStatuses[this.NOT_STARTED] = 'Commenting Not Started';
    this.commentStatuses[this.NOT_OPEN] = 'Not Open For Commenting';
    this.commentStatuses[this.CLOSED] = 'Commenting Closed';
    this.commentStatuses[this.OPEN] = 'Commenting Open';
  }

  /**
   * Get all comment periods for the specified project id. Results can be paginated
   * and sorted.
   *
   * @param {string} projId The project ID to get the comment period(s) for.
   * @param {number} pageNum The page number to paginate with.
   * @param {number} pageSize The page size to paginate with.
   * @param {string} sortBy The field to sort by.
   * @returns {Observable}
   */
  getAllByProjectId(projId: string, pageNum: number = 1, pageSize: number = 10, sortBy: string = null): Observable<Object> {
    return this.api.getPeriodsByProjId(projId, pageNum, pageSize, sortBy)
      .map((res: any) => {
        if (res) {
          const periods: Array<CommentPeriod> = [];
          if (!res || res.length === 0) {
            return { totalCount: 0, data: [] };
          }
          res[0].results.forEach(cp => {
            periods.push(new CommentPeriod(cp));
          });
          return { totalCount: res[0].total_items, data: periods };
        }
        return {};
      })
      .catch(error => this.api.handleError(error));
  }

  /**
   * Get a specific comment period by its id.
   *
   * @param {string} periodId The comment period ID to get.
   * @returns {Observable}
   */
  getById(periodId: string): Observable<CommentPeriod> {
    return this.api.getPeriod(periodId)
      .map(res => {
        if (res && res.length > 0) {
          // return the first (only) comment period
          return new CommentPeriod(res[0]);
        }
        return null;
      })
      .catch(error => this.api.handleError(error));
  }

  /**
   * Get a comment period summary.
   *
   * @param {string} periodId The comment period ID to get.
   * @returns {Observable}
   */
  getSummaryById(periodId: string): Observable<CommentPeriodSummary> {
    return this.api.getPeriodSummary(periodId)
      .map(res => {
        if (res) {
          return new CommentPeriodSummary(res);
        }
        return null;
      })
      .catch(error => this.api.handleError(error));
  }

  /**
   * Add a new coment period.
   *
   * @param {CommentPeriod} commentPeriod The comment period object to add.
   * @returns {Observable}
   */
  add(commentPeriod: CommentPeriod): Observable<CommentPeriod> {
    return this.api.addCommentPeriod(commentPeriod)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Save a comment period.
   *
   * @param {CommentPeriod} orig The comment period object to save.
   * @returns {Observable}
   */
  save(orig: CommentPeriod): Observable<CommentPeriod> {
    // make a (deep) copy of the passed-in comment period so we don't change it
    const period = _.cloneDeep(orig);

    return this.api.saveCommentPeriod(period)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Delete a comment period.
   *
   * @param {CommentPeriod} period The comment period to delete.
   * @returns {Observable}
   */
  delete(period: CommentPeriod): Observable<CommentPeriod> {
    return this.api.deleteCommentPeriod(period)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Publish a comment period by toggling the visibility for "public" app users.
   *
   * @param {CommentPeriod} period The comment period to publish.
   * @returns {Observable}
   */
  publish(period: CommentPeriod): Observable<CommentPeriod> {
    return this.api.publishCommentPeriod(period)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Unpublish a comment period by toggling the visibility for "public" app users.
   *
   * @param {CommentPeriod} period The comment period to unpublish.
   * @returns {Observable}
   */
  unPublish(period: CommentPeriod): Observable<CommentPeriod> {
    return this.api.unPublishCommentPeriod(period)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Get the first comment period in a list of periods.
   *
   * @param {Array} periods The comment period list.
   * @returns {CommentPeriod}
   */
  getCurrent(periods: CommentPeriod[]): CommentPeriod {
    return (periods.length > 0) ? periods[0] : null;
  }

  /**
   * Get the status of the comment period by checking the date range and seeing if
   * the present is contained therein.
   *
   * @param {CommentPeriod} period The comment period to check the status of.
   * @returns {string}
   */
  getStatus(period: CommentPeriod): string {
    if (!period || !period.dateStarted || !period.dateCompleted) {
      return this.commentStatuses[this.NOT_OPEN];
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(period.dateStarted);
    const endDate = new Date(period.dateCompleted);

    if (endDate < today) {
      return this.commentStatuses[this.CLOSED];
    } else if (startDate > today) {
      return this.commentStatuses[this.NOT_STARTED];
    } else {
      return this.commentStatuses[this.OPEN];
    }
  }

  /**
   * Check if a comment period is not open.
   *
   * @param {CommentPeriod} period The comment period to check.
   * @returns {boolean}
   */
  isNotOpen(period: CommentPeriod): boolean {
    return (this.getStatus(period) === this.commentStatuses[this.NOT_OPEN]);
  }

  /**
   * Check if a comment period is closed.
   *
   * @param {CommentPeriod} period The comment period to check.
   * @returns {CommentPeriod}
   */
  isClosed(period: CommentPeriod): boolean {
    return (this.getStatus(period) === this.commentStatuses[this.CLOSED]);
  }

  /**
   * Check if the comment period hasn't started yet.
   *
   * @param {CommentPeriod} period The comment period to check.
   * @returns {boolean}
   */
  isNotStarted(period: CommentPeriod): boolean {
    return (this.getStatus(period) === this.commentStatuses[this.NOT_STARTED]);
  }

  /**
   * Check if a comment period is open.
   *
   * @param {CommentPeriod} period The comment period to check.
   * @returns {boolean}
   */
  isOpen(period: CommentPeriod): boolean {
    return (this.getStatus(period) === this.commentStatuses[this.OPEN]);
  }
}
