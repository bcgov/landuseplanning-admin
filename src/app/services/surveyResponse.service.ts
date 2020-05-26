import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { SurveyResponse } from 'app/models/surveyResponse';
import { DocumentService } from './document.service';
import { flatMap, mergeMap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { Survey } from 'app/models/survey';

@Injectable()
export class SurveyResponseService {

  public pendingCommentCount = 0;
  public nextCommentId = null;

  constructor(
    private api: ApiService,
    private documentService: DocumentService
  ) { }


  // get count of comments for the specified comment period id
  getCountByPeriodId(periodId: string): Observable<number> {
    return this.api.getCountCommentsByPeriodId(periodId)
      .catch(error => this.api.handleError(error));
  }

  getById(surveyResponseId: string, populateNextComment: boolean = false): Observable<SurveyResponse> {
    return this.api.getSurveyResponse(surveyResponseId, populateNextComment)
      .pipe(
        flatMap((res: any) => {
          // this.pendingCommentCount = res.headers.get('x-pending-comment-count');
          // this.nextCommentId = res.headers.get('x-next-comment-id');

          let surveyResponses = res.body;
          if (!surveyResponses || surveyResponses.length === 0) {
            return of(null as SurveyResponse);
          }
          // Safety check for null documents or an empty array of documents.
          if (surveyResponses[0].documents === null || surveyResponses[0].documents && surveyResponses[0].documents.length === 0) {
            return of(new SurveyResponse(surveyResponses[0]));
          }
          // now get the rest of the data for this project
          return this._getExtraAppData(new SurveyResponse(surveyResponses[0]));
        })
      )
      .catch(error => this.api.handleError(error));
  }

  // get all comments for the specified comment period id
  getByPeriodId(periodId: string, pageNum: number = null, pageSize: number = null, sortBy: string = '', count: boolean = true, filter: Object = {}): Observable<Object> {
    return this.api.getResponsesByPeriodId(periodId, pageNum, pageSize, sortBy, count, filter)
      .map((res: any) => {
        if (res) {
          const surveyResponses: Array<SurveyResponse> = [];
          if (!res || res.length === 0) {
            return { totalCount: 0, data: [] };
          }
          res[0].results.forEach(sr => {
            surveyResponses.push(new SurveyResponse(sr));
          });
          return { totalCount: res[0].total_items, data: surveyResponses };
        }
        return {};
      })
      .catch(error => this.api.handleError(error));
  }

    // get all comment periods for the specified project id
  getAllByProjectId(projId: string): Observable<Object> {
    return this.api.getResponsesByProjId(projId)
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

  private _getExtraAppData(surveyResponse: SurveyResponse): Observable<SurveyResponse> {
    return forkJoin(
      this.documentService.getByMultiId(surveyResponse.documents)
    ).map((payloads: any) => {
      surveyResponse.documentsList = payloads[0];
      return surveyResponse;
    });
  }
}
