import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { Survey } from 'app/models/survey';
import { CommentPeriod } from 'app/models/commentPeriod';
import { CommentPeriodSummary } from 'app/models/commentPeriodSummary';

@Injectable()
export class SurveyService {

  // statuses (also used as short strings)
  readonly NOT_STARTED = 'Not Started';
  readonly NOT_OPEN = 'Not Open';
  readonly CLOSED = 'Closed';
  readonly OPEN = 'Open';

  // use helpers to get these:
  private commentStatuses = [];
  private survey: Survey;

  constructor(private api: ApiService) {
    // user-friendly strings
    this.commentStatuses[this.NOT_STARTED] = 'Commenting Not Started';
    this.commentStatuses[this.NOT_OPEN] = 'Not Open For Commenting';
    this.commentStatuses[this.CLOSED] = 'Commenting Closed';
    this.commentStatuses[this.OPEN] = 'Commenting Open';
  }

  // get all comment periods for the specified project id
  getAllByProjectId(projId: string, pageNum: number = 1, pageSize: number = 10, sortBy: string = null): Observable<Object> {
    return this.api.getSurveysByProjId(projId, pageNum, pageSize, sortBy)
      .map((res: any) => {
        if (res) {
          const periods: Array<Survey> = [];
          if (!res || res.length === 0) {
            return { totalCount: 0, data: [] };
          }
          res[0].results.forEach(survey => {
            periods.push(new Survey(survey));
          });
          return { totalCount: res[0].total_items, data: periods };
        }
        return {};
      })
      .catch(error => this.api.handleError(error));
  }

  // get a specific comment period by its id
  getById(surveyId: string): Observable<Survey> {
    return this.api.getSurvey(surveyId)
      .map(res => {
        if (res && res.length > 0) {
          // return the first (only) comment period
          return new Survey(res[0]);
        }
        return null;
      })
      .catch(error => this.api.handleError(error));
  }

  // getSummaryById(periodId: string): Observable<CommentPeriodSummary> {
  //   return this.api.getPeriodSummary(periodId)
  //     .map(res => {
  //       if (res) {
  //         return new CommentPeriodSummary(res);
  //       }
  //       return null;
  //     })
  //     .catch(error => this.api.handleError(error));
  // }

    // get a survey selected on a comment period by comment period id
    getSelectedSurveyByCPId(periodId: string): Observable<Survey> {
      return this.api.getPeriodSelectedSurvey(periodId)
        .map((res: any) => {
          if (res) {
            const surveys = res;
            // return the first (only) comment period
            return surveys.length > 0 ? new Survey(surveys[0]) : null;
          }
        })
        .map((survey: Survey) => {
          if (!survey) { return null as Survey; }

          this.survey = survey;
          return this.survey;
        })
        .catch(this.api.handleError);
    }

  add(survey: Survey): Observable<Survey> {
    return this.api.addSurvey(survey)
      .catch(error => this.api.handleError(error));
  }

  save(originalSurvey: Survey): Observable<Survey> {
    // make a (deep) copy of the passed-in survey so we don't change it
    const survey = _.cloneDeep(originalSurvey);

    return this.api.saveSurvey(survey)
      .catch(error => this.api.handleError(error));
  }

  delete(survey: Survey): Observable<Survey> {
    return this.api.deleteSurvey(survey)
      .catch(error => this.api.handleError(error));
  }

  // publish(period: CommentPeriod): Observable<CommentPeriod> {
  //   return this.api.publishCommentPeriod(period)
  //     .catch(error => this.api.handleError(error));
  // }

  // unPublish(period: CommentPeriod): Observable<CommentPeriod> {
  //   return this.api.unPublishCommentPeriod(period)
  //     .catch(error => this.api.handleError(error));
  // }

  // returns first period
  // multiple comment periods are currently not supported
  // getCurrent(periods: CommentPeriod[]): CommentPeriod {
  //   return (periods.length > 0) ? periods[0] : null;
  // }

  // getStatus(period: CommentPeriod): string {
  //   if (!period || !period.dateStarted || !period.dateCompleted) {
  //     return this.commentStatuses[this.NOT_OPEN];
  //   }

  //   const now = new Date();
  //   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  //   const startDate = new Date(period.dateStarted);
  //   const endDate = new Date(period.dateCompleted);

  //   if (endDate < today) {
  //     return this.commentStatuses[this.CLOSED];
  //   } else if (startDate > today) {
  //     return this.commentStatuses[this.NOT_STARTED];
  //   } else {
  //     return this.commentStatuses[this.OPEN];
  //   }
  // }

  // isNotOpen(period: CommentPeriod): boolean {
  //   return (this.getStatus(period) === this.commentStatuses[this.NOT_OPEN]);
  // }

  // isClosed(period: CommentPeriod): boolean {
  //   return (this.getStatus(period) === this.commentStatuses[this.CLOSED]);
  // }

  // isNotStarted(period: CommentPeriod): boolean {
  //   return (this.getStatus(period) === this.commentStatuses[this.NOT_STARTED]);
  // }

  // isOpen(period: CommentPeriod): boolean {
  //   return (this.getStatus(period) === this.commentStatuses[this.OPEN]);
  // }

}
