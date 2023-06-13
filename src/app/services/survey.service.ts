import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { Survey } from 'app/models/survey';

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

  /**
   * Get all surveys for the specified project id. Results can be sorted and paginated.
   *
   * @param {string} projId The project ID to get surveys for.
   * @param {number} pageNum The page number to paginate with.
   * @param {number} pageSize The page size to paginate with.
   * @param {string} sortBy The field to sort by.
   * @returns {Observable}
   */
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

  /**
   * Get a specific survey by its ID.
   *
   * @param {string} surveyId The survey ID.
   * @returns {Observable}
   */
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

  /**
   * Get a survey selected on a comment period by comment period ID.
   *
   * @param {string} periodId The comment period ID to get the survey with.
   * @returns {Observable}
   */
  getSelectedSurveyByCPId(periodId: string): Observable<Survey> {
    return this.api.getPeriodSelectedSurvey(periodId)
      .map((res: any) => {
        if (res) {
          const surveys = res;
          // return the first (only) survey
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

  /**
   * Add a new survey.
   *
   * @param {Survey} survey New survey object to add.
   * @returns {Observable}
   */
  add(survey: Survey): Observable<Survey> {
    return this.api.addSurvey(survey)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Save a survey.
   *
   * @param {Survey} originalSurvey The survey to save.
   * @returns {Observable}
   */
  save(originalSurvey: Survey): Observable<Survey> {
    // make a (deep) copy of the passed-in survey so we don't change it
    const survey = _.cloneDeep(originalSurvey);

    return this.api.saveSurvey(survey)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Delete a survey.
   *
   * @param {Survey} survey The survey to delete.
   * @returns {Observable}
   */
  delete(survey: Survey): Observable<Survey> {
    return this.api.deleteSurvey(survey)
      .catch(error => this.api.handleError(error));
  }

}
