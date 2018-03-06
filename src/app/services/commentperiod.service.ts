import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { CommentPeriod } from 'app/models/commentperiod';

@Injectable()
export class CommentPeriodService {
  private commentPeriod: CommentPeriod = null;
  commentStatuses = {};

  constructor(private api: ApiService) {
    this.commentStatuses['NOT STARTED'] = 'Commenting Not Started';
    this.commentStatuses['NOT OPEN'] = 'Not Open For Commenting';
    this.commentStatuses['CLOSED'] = 'Commenting Closed';
    this.commentStatuses['OPEN'] = 'Commenting Open';
  }

  // get all comment periods for the specified application id
  getAllByApplicationId(appId: string): Observable<CommentPeriod[]> {
    return this.api.getPeriodsByAppId(appId)
      .map((res: Response) => {
        const periods = res.text() ? res.json() : [];
        periods.forEach((period, index) => {
          periods[index] = new CommentPeriod(period);
        });
        return periods;
      })
      .catch(this.api.handleError);
  }

  // get a specific comment period by its id
  getById(periodId: string, forceReload: boolean = false): Observable<CommentPeriod> {
    if (this.commentPeriod && this.commentPeriod._id === periodId && !forceReload) {
      return Observable.of(this.commentPeriod);
    }

    return this.api.getPeriod(periodId)
      .map((res: Response) => {
        const periods = res.text() ? res.json() : [];
        // return the first (only) comment period
        return periods.length > 0 ? new CommentPeriod(periods[0]) : null;
      })
      .map((commentPeriod: CommentPeriod) => {
        if (!commentPeriod) { return null; }

        this.commentPeriod = commentPeriod;
        return this.commentPeriod;
      })
      .catch(this.api.handleError);
  }

  add(commentperiod: CommentPeriod): Observable<CommentPeriod> {
    return this.api.addCommentPeriod(commentperiod)
      .map((res: Response) => {
        const cp = res.text() ? res.json() : null;
        return cp ? new CommentPeriod(cp) : null;
      })
      .catch(this.api.handleError);
  }

  save(commentperiod: CommentPeriod): Observable<CommentPeriod> {
    return this.api.saveCommentPeriod(commentperiod)
      .map((res: Response) => {
        const cp = res.text() ? res.json() : null;
        return cp ? new CommentPeriod(cp) : null;
      })
      .catch(this.api.handleError);
  }

  delete(commentperiod: CommentPeriod): Observable<any> {
    return this.api.deleteCommentPeriod(commentperiod)
      .map(res => { return res; })
      .catch(this.api.handleError);
  }

  publish(commentperiod: CommentPeriod): Observable<CommentPeriod> {
    return this.api.publishCommentPeriod(commentperiod)
      .map(
        project => {
          commentperiod.isPublished = true;
          return commentperiod;
        }
      )
      .catch(this.api.handleError);
  }

  unPublish(commentperiod: CommentPeriod): Observable<CommentPeriod> {
    return this.api.unPublishCommentPeriod(commentperiod)
      .map(
        project => {
          commentperiod.isPublished = false;
          return commentperiod;
        }
      )
      .catch(this.api.handleError);
  }

  // returns current (latest) period
  // assumes if there's an open period, there isn't also future one
  getCurrent(periods: CommentPeriod[]): CommentPeriod {
    const sortedPeriods = periods.sort((a, b) => a.startDate < b.startDate ? 1 : 0);
    return (sortedPeriods.length > 0) ? sortedPeriods[0] : null;
  }

  isOpen(period: CommentPeriod): boolean {
    return (this.getStatus(period) === this.commentStatuses['OPEN']);
  }

  isOpenNotStarted(period: CommentPeriod): boolean {
    return (this.getStatus(period) === this.commentStatuses['OPEN'] ||
      this.getStatus(period) === this.commentStatuses['NOT STARTED']);
  }

  getStatus(period: CommentPeriod): string {
    if (!period || !period.startDate || !period.endDate) {
      return this.commentStatuses['NOT OPEN'];
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);

    if (endDate < today) {
      return this.commentStatuses['CLOSED'];
    } else if (startDate > today) {
      return this.commentStatuses['NOT STARTED'];
    } else {
      return this.commentStatuses['OPEN'];
    }
  }
}
