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

  /**
   * Get a survey response by ID.
   *
   * @param {string} surveyResponseId The survey response ID to retrieve with.
   * @returns {Observable}
   */
  getById(surveyResponseId: string): Observable<SurveyResponse> {
    return this.api.getSurveyResponse(surveyResponseId)
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

  /**
   * Get all survey responses for the specified comment period id.
   * Results can be sorted and paginated.
   *
   * @param {string} periodId The comment period ID.
   * @param {number} pageNum The page number to paginate with.
   * @param {number} pageSize The page size to paginate with.
   * @param {string} sortBy The field to sort by.
   * @param {boolean} count Whether or not to enumerate the total results.
   * @returns {Observable}
   */
  getByPeriodId(periodId: string, pageNum: number = null, pageSize: number = null, sortBy: string = '', count: boolean = true): Observable<Object> {
    return this.api.getResponsesByPeriodId(periodId, pageNum, pageSize, sortBy, count)
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

  /**
   * Get all survey responses by project ID.
   *
   * @param {string} projId The project ID to get responses for.
   * @returns {Observable}
   */
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

  /**
   * Internal helper method to get attached documents on survey responses.
   *
   * @param {SurveyResponse} surveyResponse The survey response to get attached documents on.
   * @returns {Observable}
   */
  private _getExtraAppData(surveyResponse: SurveyResponse): Observable<SurveyResponse> {
    return forkJoin(
      this.documentService.getByMultiId(surveyResponse.documents)
    ).map((payloads: any) => {
      surveyResponse.documentsList = payloads[0];
      return surveyResponse;
    });
  }
}
