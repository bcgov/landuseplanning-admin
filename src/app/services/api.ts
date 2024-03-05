import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/throw';
import { throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { each, isEmpty } from 'lodash';

import { KeycloakService } from 'app/services/keycloak.service';

import { DocumentSection } from 'app/models/documentSection';
import { Project } from 'app/models/project';
import { Comment } from 'app/models/comment';
import { CommentPeriod } from 'app/models/commentPeriod';
import { Survey } from 'app/models/survey';
import { Decision } from 'app/models/decision';
import { Document } from 'app/models/document';
import { SearchResults } from 'app/models/search';
import { User } from 'app/models/user';
import { Org } from 'app/models/org';
import { RecentActivity } from 'app/models/recentActivity';
import { CommentPeriodSummary } from 'app/models/commentPeriodSummary';
import { EmailSubscribe } from 'app/models/emailSubscribe';

interface LocalLoginResponse {
  _id: string;
  title: string;
  created_at: string;
  startTime: string;
  endTime: string;
  state: boolean;
  accessToken: string;
}

const encode = encodeURIComponent;
window['encodeURIComponent'] = (component: string) => {
  return encode(component).replace(/[!'()*]/g, (c) => {
    // Also encode !, ', (, ), and *
    return '%' + c.charCodeAt(0).toString(16);
  });
};

@Injectable()
export class ApiService {

  public token: string;
  public isMS: boolean; // IE, Edge, etc
  // private jwtHelper: JwtHelperService;
  pathAPI: string;
  params: Params;
  public env: string;  // Could be anything per Openshift settings but generally is one of 'local' | 'dev' | 'test' | 'prod' | 'demo'

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {
    // this.jwtHelper = new JwtHelperService();
    const currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.isMS = window.navigator.msSaveOrOpenBlob ? true : false;

    // The following items are loaded by a file that is only present on cluster builds.
    // Locally, this will be empty and local defaults will be used.
    const remote_api_path = window.localStorage.getItem('from_admin_server--remote_api_path');
    const remote_public_path = window.localStorage.getItem('from_admin_server--remote_public_path');  // available in case its ever needed
    const deployment_env = window.localStorage.getItem('from_admin_server--deployment_env');

    this.pathAPI = (isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;
    this.env = (isEmpty(deployment_env)) ? 'local' : deployment_env;
  }

  /**
   * Handle if an error is returned from the API. If the user isn't authenticated,
   * kick them back to the login screen.
   *
   * @param {any} error An error returned from the observable.
   * @returns {Observable}
   */
  handleError(error: any): Observable<never> {
    const reason = error.message ? (error.error ? `${error.message} - ${error.error.message}` : error.message) : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    console.error('API error =', reason);
    if (error && error.status === 403 && !this.keycloakService.isKeyCloakEnabled()) {
      window.location.href = '/admin/login';
    }
    return throwError(error);
  }

  /**
   * Manually log the user in if the keycloak instance isn't working. Contact the Login
   * Service and get an access token if the user authenticates successfully.
   * This function may be removed at some point as I'm not sure it's used anywhere.
   *
   * @deprecated
   * @param {string} username The username to log in with.
   * @param {string} password The password to log in with.
   * @returns {Observable}
   */
  login(username: string, password: string): Observable<boolean> {
    return this.http.post<LocalLoginResponse>(`${this.pathAPI}/login/token`, { username: username, password: password })
      .map(res => {
        // login successful if there's a jwt token in the response
        if (res && res.accessToken) {
          this.token = res.accessToken;
          window.localStorage.clear();
          // store username and jwt token in local storage to keep user logged in between page refreshes
          window.localStorage.setItem('currentUser', JSON.stringify({ username: username, token: this.token }));

          return true; // successful login
        }
        return false; // failed login
      });
  }

  /**
   * Log the user out by resetting the token and remove user from local storage.
   *
   * @return {void}
   */
  logout() {
    // clear token + remove user from local storage to log user out
    this.token = null;
    window.localStorage.removeItem('currentUser');
  }

  /**
   * Converts a query string to an API request for all projects. Returns each project
   * with a specific set of fields.
   *
   * @param {number} pageNum The number of pages of results to return.
   * @param {number} pageSize The page size for the results.
   * @param {string} sortBy Sort the results by a given field.
   * @param {Boolean} populate Whether or not to populate the results(a Mongo DB operation).
   * @returns {Observable}
   */
  getProjects(pageNum: number, pageSize: number, sortBy: string, populate: Boolean = true): Observable<Object> {
    const fields = [
      'engagementStatus',
      'name',
      'partner',
      'region',
      'agreements',
      'code',
      'currentPhaseName',
      'epicProjectID',
    ];

    let queryString = `project?`;
    if (pageNum !== null) { queryString += `pageNum=${pageNum - 1}&`; }
    if (pageSize !== null) { queryString += `pageSize=${pageSize}&`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `sortBy=${sortBy}&`; }
    if (populate !== null) { queryString += `populate=${populate}&`; }
    queryString += `fields=${this.buildValues(fields)}`;

    return this.http.get<Object>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Get the full configuration dataset from the DB.
   *
   * @param {string} dataSet The dataset to retrieve.
   * @returns {Observable}
   */
  getFullDataSet(dataSet: string): Observable<any> {
    return this.http.get<any>(`${this.pathAPI}/search?pageSize=1000&dataset=${dataSet}`, {});
  }

  /**
   * Get a single project from the DB. Comment periods can be filtered by start and end date.
   *
   * @param {string} id The project ID.
   * @param {string} cpStart The comment period start.
   * @param {string} cpEnd The comment period end.
   * @returns {Observable}
   */
  getProject(id: string, cpStart: string, cpEnd: string): Observable<Project[]> {
    const fields = [
      'existingLandUsePlans',
      'centroid',
      'description',
      'details',
      'engagementStatus',
      'logos',
      'backgroundInfo',
      'backgroundImage',
      'engagementInfo',
      'engagementLabel',
      'documentInfo',
      'overlappingRegionalDistricts',
      'name',
      'partner',
      'region',
      'agreements',
      'addedBy',
      'existingLandUsePlanURLs',
      'code',
      'eaDecision',
      'commodity',
      'currentPhaseName',
      'dateAdded',
      'dateCommentsClosed',
      'dateCommentsOpen',
      'dateUpdated',
      'duration',
      'eaoMember',
      'epicProjectID',
      'fedElecDist',
      'isTermsAgreed',
      'overallProgress',
      'primaryContact',
      'proMember',
      'provElecDist',
      'shortName',
      'projectPhase',
      'substitution',
      'updatedBy',
      'projectLead',
      'projectDirector',
      'pins',
      'read',
      'write',
      'delete',
      'activitiesAndUpdatesEnabled',
      'contactFormEnabled',
      'contactFormEmails'
    ];
    let queryString = `project/${id}?populate=true`;
    if (cpStart !== null) { queryString += `&cpStart[since]=${cpStart}`; }
    if (cpEnd !== null) { queryString += `&cpEnd[until]=${cpEnd}`; }
    queryString += `&fields=${this.buildValues(fields)}`;
    return this.http.get<Project[]>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Return to the total count of returned projects.
   *
   * @returns {Observable}
   */
  getCountProjects(): Observable<number> {
    const queryString = `project`;
    return this.http.head<HttpResponse<Object>>(`${this.pathAPI}/${queryString}`, { observe: 'response' })
      .pipe(
        map(res => {
          // retrieve the count from the response headers
          return parseInt(res.headers.get('x-total-count'), 10);
        })
      );
  }

  /**
   * Add project to the DB.
   *
   * @param {Proejct} proj The project object to add.
   * @returns {Observable}
   */
  addProject(proj: Project): Observable<Project> {
    const queryString = `project/`;
    return this.http.post<Project>(`${this.pathAPI}/${queryString}`, proj, {});
  }

  /**
   * Publish a project by toggling its visibility to "public" app users.
   *
   * @param {Project} proj Project to publish.
   * @returns {Observable}
   */
  publishProject(proj: Project): Observable<Project> {
    const queryString = `project/${proj._id}/publish`;
    return this.http.put<Project>(`${this.pathAPI}/${queryString}`, proj, {});
  }

  /**
   * Unpublish a project by toggling its visibility to "public" app users.
   *
   * @param {Project} proj Project to unpublish.
   * @returns {Observable}
   */
  unPublishProject(proj: Project): Observable<Project> {
    const queryString = `project/${proj._id}/unpublish`;
    return this.http.put<Project>(`${this.pathAPI}/${queryString}`, proj, {});
  }

  /**
   * Delete a project in the DB.
   *
   * @param {Project} proj The project to delete.
   * @returns {Observable}
   */
  deleteProject(proj: Project): Observable<Project> {
    const queryString = `project/${proj._id}`;
    return this.http.delete<Project>(`${this.pathAPI}/${queryString}`, {});
  }

  addPinsToProject(proj: Project, pins: any): Observable<Project> {
    const queryString = `project/${proj._id}/pin`;
    return this.http.post<Project>(`${this.pathAPI}/${queryString}`, pins, {});
  }

  addGroupToProject(proj: Project, group: any): Observable<Project> {
    const queryString = `project/${proj._id}/group`;
    return this.http.post<Project>(`${this.pathAPI}/${queryString}`, { group: group }, {});
  }

  deletePin(projId: string, pinId: string): Observable<Project> {
    const queryString = `project/${projId}/pin/${pinId}`;
    return this.http.delete<Project>(`${this.pathAPI}/${queryString}`, {});
  }

  getProjectPins(id: string, pageNum: number, pageSize: number, sortBy: any): Observable<Org> {
    let queryString = `project/${id}/pin`;
    if (pageNum !== null) { queryString += `?pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { queryString += `&pageSize=${pageSize}`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `&sortBy=${sortBy}`; }
    return this.http.get<any>(`${this.pathAPI}/${queryString}`, {});
  }

  getProjectGroupMembers(id: string, groupId: string, pageNum: number, pageSize: number, sortBy: any): Observable<Org> {
    let queryString = `project/${id}/group/${groupId}/members`;
    if (pageNum !== null) { queryString += `?pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { queryString += `&pageSize=${pageSize}`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `&sortBy=${sortBy}`; }
    return this.http.get<any>(`${this.pathAPI}/${queryString}`, {});
  }

  addMembersToGroup(proj: Project, groupId: string, members: any): Observable<Project> {
    const queryString = `project/${proj._id}/group/${groupId}/members`;
    return this.http.post<Project>(`${this.pathAPI}/${queryString}`, members, {});
  }

  deleteMembersFromGroup(projId: string, groupId: string, member: string): Observable<Project> {
    const queryString = `project/${projId}/group/${groupId}/members/${member}`;
    return this.http.delete<Project>(`${this.pathAPI}/${queryString}`, {});
  }

  saveGroup(projectId: Project, groupId: any, groupObj: any): Observable<Project> {
    const queryString = `project/${projectId}/group/${groupId}`;
    return this.http.put<Project>(`${this.pathAPI}/${queryString}`, groupObj, {});
  }

  deleteGroup(proj: Project, groupId: string): Observable<Project> {
    const queryString = `project/${proj._id}/group/${groupId}`;
    return this.http.delete<Project>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Save a project.
   *
   * @param {Project} proj The project to delete.
   * @returns {Observable}
   */
  saveProject(proj: Project): Observable<Project> {
    const queryString = `project/${proj._id}`;
    return this.http.put<Project>(`${this.pathAPI}/${queryString}`, proj, {});
  }

  //
  // Decisions
  //
  getDecisionsByAppId(projId: string): Observable<Decision[]> {
    const fields = [
      '_addedBy',
      '_project',
      'code',
      'name',
      'description'
    ];
    const queryString = `decision?_project=${projId}&fields=${this.buildValues(fields)}`;
    return this.http.get<Decision[]>(`${this.pathAPI}/${queryString}`, {});
  }

  // NB: returns array with 1 element
  getDecision(id: string): Observable<Decision[]> {
    const fields = [
      '_addedBy',
      '_project',
      'code',
      'name',
      'description'
    ];
    const queryString = `decision/${id}?fields=${this.buildValues(fields)}`;
    return this.http.get<Decision[]>(`${this.pathAPI}/${queryString}`, {});
  }

  addDecision(decision: Decision): Observable<Decision> {
    const queryString = `decision/`;
    return this.http.post<Decision>(`${this.pathAPI}/${queryString}`, decision, {});
  }

  saveDecision(decision: Decision): Observable<Decision> {
    const queryString = `decision/${decision._id}`;
    return this.http.put<Decision>(`${this.pathAPI}/${queryString}`, decision, {});
  }

  deleteDecision(decision: Decision): Observable<Decision> {
    const queryString = `decision/${decision._id}`;
    return this.http.delete<Decision>(`${this.pathAPI}/${queryString}`, {});
  }

  publishDecision(decision: Decision): Observable<Decision> {
    const queryString = `decision/${decision._id}/publish`;
    return this.http.put<Decision>(`${this.pathAPI}/${queryString}`, decision, {});
  }

  unPublishDecision(decision: Decision): Observable<Decision> {
    const queryString = `decision/${decision._id}/unpublish`;
    return this.http.put<Decision>(`${this.pathAPI}/${queryString}`, decision, {});
  }

  /**
   * Add a new survey.
   *
   * @param {Survey} survey The survey to add.
   * @returns {Observable}
   */
  addSurvey(survey): Observable<any> {
    const queryString = `survey/`;
    return this.http.post<any>(`${this.pathAPI}/${queryString}`, survey, {});
  }

  /**
   * Delete a survey.
   *
   * @param {Survey} survey The survey to delete.
   * @returns {Observable}
   */
  deleteSurvey(survey: Survey): Observable<Survey> {
    const queryString = `survey/${survey._id}`;
    return this.http.delete<Survey>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Get a survey and include a specified set of fields in the result.
   *
   * @param {string} id The survey to get by ID.
   * @returns {Observable}
   */
  getSurvey(id: string): Observable<Survey[]> {
    const fields = [
      '_id',
      '_schemaName',
      'name',
      'lastSaved',
      'project',
      'questions',
      'read',
      'write',
      'delete'
    ];
    const queryString = `survey/${id}?fields=${this.buildValues(fields)}`;
    return this.http.get<Survey[]>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Get a survey by project ID - include a specified set of fields in the result(s).
   * Results can be paginated and sorted.
   *
   * @param {string} projId The ID of the project to get surveys by.
   * @param {number} pageNum The page number to paginate by.
   * @param {number} pageSize The page size to paginate by.
   * @param {any} sortBy The field to sort by.
   * @returns {Observable}
   */
  getSurveysByProjId(projId: string, pageNum: number, pageSize: number, sortBy: string): Observable<Object> {
    const fields = [
      'project',
      'dateAdded',
      'lastSaved',
      'name'
    ];

    let queryString = `survey?&project=${projId}&`;
    if (pageNum !== null) { queryString += `pageNum=${pageNum - 1}&`; }
    if (pageSize !== null) { queryString += `pageSize=${pageSize}&`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `sortBy=${sortBy}&`; }
    queryString += `count=true&`;
    queryString += `fields=${this.buildValues(fields)}`;

    return this.http.get<Object>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Get the survey attached to a particular comment period.
   *
   * @param {string} periodId The comment period to get the survey for.
   * @returns {Observable}
   */
  getPeriodSelectedSurvey(periodId: string): Observable<Survey[]> {
    const fields = [
      '_id',
      'name',
      'lastSaved',
      'dateAdded',
      'project',
      'questions',
    ];

    const queryString = `survey?commentPeriod=${periodId}&fields=` + this.buildValues(fields);
    return this.http.get<Survey[]>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Save a survey.
   *
   * @param {Survey} survey The survey to save.
   * @returns {Observable}
   */
  saveSurvey(survey: Survey): Observable<Survey> {
    const queryString = `survey/${survey._id}`;
    return this.http.put<Survey>(`${this.pathAPI}/${queryString}`, survey, {});
  }

  /**
   * Get a particular survey response with a specified set of fields.
   *
   * @param {string} id The survey response ID.
   * @returns {Observable}
   */
  getSurveyResponse(id: string): Observable<any> {
    const fields = [
      '_id',
      'author',
      'commentId',
      'dateAdded',
      'documents',
      'location',
      'period',
      'project',
      'survey',
      'responses',
      'read',
      'write',
      'delete'
    ];
    let queryString = `surveyResponse/${id}?fields=${this.buildValues(fields)}`;
    return this.http.get<any>(`${this.pathAPI}/${queryString}`, { observe: 'response' });
  }

  /**
   * Get the survey responses by comment period ID. Results can also be paginated
   * and sorted by a specific field.
   *
   * @param {string} periodId The comment period ID to get survey responses for.
   * @param {number} pageNum The page number to paginate with.
   * @param {number} pageSize The page size to paginate with.
   * @param {string} sortBy The field to sort by.
   * @param {boolean} count Whether or not to get the count of the results.
   * @returns {Observable}
   */
  getResponsesByPeriodId(periodId: string, pageNum: number, pageSize: number, sortBy: string, count: boolean): Observable<Object> {
    const fields = [
      '_id',
      'author',
      'location',
      'commentId',
      'dateAdded',
      'documents',
      'project',
      'period',
      'survey',
      'read'
    ];

    let queryString = `surveyResponse?&period=${periodId}`;
    if (pageNum !== null) { queryString += `&pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { queryString += `&pageSize=${pageSize}`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `&sortBy=${sortBy}`; }
    if (count !== null) { queryString += `&count=${count}`; }
    queryString += `&fields=${this.buildValues(fields)}`;

    return this.http.get<Object>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Get survey responses by project ID.
   *
   * @param {string} projId The project ID to get the responses for.
   * @returns {Observable}
   */
  getResponsesByProjId(projId: string): Observable<Object> {
    const fields = [
      'project'
    ];

    let queryString = `surveyResponse?&project=${projId}&`;
    queryString += `count=true&`;
    queryString += `fields=${this.buildValues(fields)}`;

    return this.http.get<Object>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Get comment periods by project ID. Results can be sorted and paginated.
   *
   * @param {string} projId The project ID to get comment periods.
   * @param {number} pageNum The page number to paginate with.
   * @param {number} pageSize The page size to paginate with.
   * @param {string} sortBy The field to sort by.
   * @returns {Observable}
   */
  getPeriodsByProjId(projId: string, pageNum: number, pageSize: number, sortBy: string): Observable<Object> {
    const fields = [
      'project',
      'dateStarted',
      'dateCompleted',
      'externalEngagementTool',
      'externalToolPopupText'
    ];

    let queryString = `commentperiod?&project=${projId}&`;
    if (pageNum !== null) { queryString += `pageNum=${pageNum - 1}&`; }
    if (pageSize !== null) { queryString += `pageSize=${pageSize}&`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `sortBy=${sortBy}&`; }
    queryString += `count=true&`;
    queryString += `fields=${this.buildValues(fields)}`;

    return this.http.get<Object>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Get a comment period and return it with a specified set of fields.
   *
   * @param {string} id Comment period ID to get by.
   * @returns {Observable}
   */
  getPeriod(id: string): Observable<CommentPeriod[]> {
    const fields = [
      '_id',
      '__v',
      '_schemaName',
      'addedBy',
      'additionalText',
      'ceaaAdditionalText',
      'ceaaInformationLabel',
      'ceaaRelatedDocuments',
      'classificationRoles',
      'classifiedPercent',
      'commenterRoles',
      'commentPeriodInfo',
      'dateAdded',
      'dateCompleted',
      'dateCompletedEst',
      'dateStarted',
      'dateStartedEst',
      'dateUpdated',
      'downloadRoles',
      'informationLabel',
      'instructions',
      'isClassified',
      'isPublished',
      'isResolved',
      'isVetted',
      'commentingMethod',
      'externalToolPopupText',
      'surveySelected',
      'milestone',
      'openCommentPeriod',
      'openHouses',
      'periodType',
      'phase',
      'phaseName',
      'project',
      'publishedPercent',
      'rangeOption',
      'rangeType',
      'relatedDocuments',
      'resolvedPercent',
      'updatedBy',
      'userCan',
      'vettedPercent',
      'vettingRoles'
    ];
    const queryString = `commentperiod/${id}?fields=${this.buildValues(fields)}`;
    return this.http.get<CommentPeriod[]>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Get comment period summary with a select set of fields.
   *
   * @param {string} id The comment period to get the summary by.
   * @returns {Observable}
   */
  getPeriodSummary(id: string): Observable<CommentPeriodSummary> {
    const fields = [
      '_id',
      '__v',
      '_schemaName',
      'addedBy',
      'additionalText',
      'ceaaAdditionalText',
      'ceaaInformationLabel',
      'ceaaRelatedDocuments',
      'classificationRoles',
      'classifiedPercent',
      'commenterRoles',
      'dateAdded',
      'dateCompleted',
      'dateCompletedEst',
      'dateStarted',
      'dateStartedEst',
      'dateUpdated',
      'downloadRoles',
      'informationLabel',
      'instructions',
      'isClassified',
      'isPublished',
      'isResolved',
      'isVetted',
      'commentingMethod',
      'externalToolPopupText',
      'surveySelected',
      'milestone',
      'openCommentPeriod',
      'openHouses',
      'periodType',
      'phase',
      'phaseName',
      'project',
      'publishedPercent',
      'rangeOption',
      'rangeType',
      'relatedDocuments',
      'resolvedPercent',
      'updatedBy',
      'userCan',
      'vettedPercent',
      'vettingRoles'
    ];
    const queryString = `commentperiod/${id}/summary?fields=${this.buildValues(fields)}`;
    return this.http.get<CommentPeriodSummary>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Add a new comment period.
   *
   * @param {CommentPeriod} period The comment period object to add.
   * @returns {Observable}
   */
  addCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/`;
    return this.http.post<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, {});
  }

  /**
   * Save a comment period.
   *
   * @param {CommentPeriod} period The comment period object to save.
   * @returns {Observable}
   */
  saveCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/${period._id}`;
    return this.http.put<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, {});
  }

  /**
   * Delete a comment period.
   *
   * @param {CommentPeriod} period The comment period object to delete.
   * @returns {Observable}
   */
  deleteCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/${period._id}`;
    return this.http.delete<CommentPeriod>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Publish a comment period by toggling its visibility to "public" app users.
   *
   * @param {CommentPeriod} period The comment period object to publish.
   * @returns {Observable}
   */
  publishCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/${period._id}/publish`;
    return this.http.put<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, {});
  }

  /**
   * Unpublish a comment period by toggling its visibility to "public" app users.
   *
   * @param {CommentPeriod} period The comment period object to unpublish.
   * @returns {Observable}
   */
  unPublishCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/${period._id}/unpublish`;
    return this.http.put<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, {});
  }

  /**
   * Get the total number of comments on a comment period.
   *
   * @param {string} periodId The comment period ID to get comments on.
   * @returns {Observable}
   */
  getCountCommentsByPeriodId(periodId: string): Observable<number> {
    // NB: count only pending comments
    const queryString = `comment?isDeleted=false&commentStatus='Pending'&_commentPeriod=${periodId}`;
    return this.http.head<HttpResponse<Object>>(`${this.pathAPI}/${queryString}`, { observe: 'response' })
      .pipe(
        map(res => {
          // retrieve the count from the response headers
          return parseInt(res.headers.get('x-total-count'), 10);
        })
      );
  }

  /**
   * Get all comments by a comment period. Results can be paginated and sorted.
   *
   * @param {string} periodId The comment period to get comments for.
   * @param {number} pageNum The page number to paginate with.
   * @param {number} pageSize The page size to paginate with.
   * @param {string} sortBy The field to sort by.
   * @param {boolean} count Whether or not to enumerate the total count of comments.
   * @param {object} filter Filter to only include certain fields.
   * @returns {Observable}
   */
  getCommentsByPeriodId(periodId: string, pageNum: number, pageSize: number, sortBy: string, count: boolean, filter: object): Observable<Object> {
    const fields = [
      '_id',
      'author',
      'project',
      'comment',
      'commentId',
      'dateAdded',
      'dateUpdated',
      'documents',
      'isAnonymous',
      'location',
      'eaoStatus',
      'period',
      'read'
    ];

    let queryString = `comment?&period=${periodId}`;
    if (pageNum !== null) { queryString += `&pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { queryString += `&pageSize=${pageSize}`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `&sortBy=${sortBy}`; }
    if (count !== null) { queryString += `&count=${count}`; }
    if (filter !== {}) {
      Object.keys(filter).forEach(key => {
        queryString += `&${key}=${filter[key]}`;
      });
    }
    queryString += `&fields=${this.buildValues(fields)}`;
    return this.http.get<Object>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Get a particular comment and return a select set of fields.
   *
   * @param {string} id The comment ID to get with.
   * @param {boolean} populateNextComment Whether or not to populate the following comment.
   * @returns {Observable}
   */
  getComment(id: string, populateNextComment: boolean): Observable<any> {
    const fields = [
      '_id',
      'author',
      'project',
      'comment',
      'commentId',
      'dateAdded',
      'datePosted',
      'dateUpdated',
      'documents',
      'eaoNotes',
      'eaoStatus',
      'isAnonymous',
      'location',
      'period',
      'proponentNotes',
      'proponentStatus',
      'publishedNotes',
      'rejectedNotes',
      'rejectedReason',
      'read',
      'write',
      'delete'
    ];
    let queryString = `comment/${id}?fields=${this.buildValues(fields)}`;
    if (populateNextComment) { queryString += '&populateNextComment=true'; }
    return this.http.get<any>(`${this.pathAPI}/${queryString}`, { observe: 'response' });
  }

  /**
   * Add a new comment.
   *
   * @param {Comment} comment The comment object to add.
   * @returns {Observable}
   */
  addComment(comment: Comment): Observable<Comment> {
    const queryString = `comment/`;
    return this.http.post<Comment>(`${this.pathAPI}/${queryString}`, comment, {});
  }

  /**
   * Save a comment.
   *
   * @param {Comment} comment The comment object to save.
   * @returns {Observable}
   */
  saveComment(comment: Comment): Observable<Comment> {
    const queryString = `comment/${comment._id}`;
    return this.http.put<Comment>(`${this.pathAPI}/${queryString}`, comment, {});
  }

  /**
   * Update the status of a comment.
   *
   * @param {Comment} comment The comment object to add.
   * @param {string} status The status to update with.
   * @returns {Observable}
   */
  updateCommentStatus(comment: Comment, status: string): Observable<Comment> {
    const queryString = `comment/${comment._id}/status`;
    return this.http.put<Comment>(`${this.pathAPI}/${queryString}`, { 'status': status }, {});
  }

  /**
   * Get documents by project. Return a select set of fields.
   *
   * @param {string} projId Project ID to return documents for.
   * @returns {Observable}
   */
  getDocumentsByAppId(projId: string): Observable<Document[]> {
    const fields = [
      '_project',
      'documentFileName',
      'displayName',
      'internalURL',
      'internalMime',
      'section',
    ];
    const queryString = `document?isDeleted=false&_project=${projId}&fields=${this.buildValues(fields)}`;
    return this.http.get<Document[]>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Get mutliple individual documents by their respective IDs.
   *
   * @param {Array} ids The document IDs to retrieve by.
   * @returns {Observable}
   */
  getDocumentsByMultiId(ids: Array<String>): Observable<Document[]> {
    const fields = [
      '_id',
      'eaoStatus',
      'internalOriginalName',
      'documentFileName',
      'labels',
      'internalOriginalName',
      'internalSize',
      'displayName',
      'section',
      'datePosted',
      'dateUploaded',
      'dateReceived',
      'documentSource',
      'internalURL',
      'internalMime',
      'checkbox',
      'project',
      'documentAuthor',
      'projectPhase',
      'description',
      'isPublished'
    ];
    const queryString = `document?docIds=${this.buildValues(ids)}&fields=${this.buildValues(fields)}`;
    return this.http.get<Document[]>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Get document by ID. Return a select set of fields.
   *
   * @param {string} id The document ID to get by.
   * @returns {Observable}
   */
  getDocument(id: string): Observable<Document[]> {
    const fields = [
      '_addedBy',
      'documentFileName',
      'labels',
      'internalOriginalName',
      'displayName',
      'datePosted',
      'dateUploaded',
      'dateReceived',
      'documentSource',
      'section',
      'internalURL',
      'internalMime',
      'internalSize',
      'checkbox',
      'project',
      'documentAuthor',
      'projectPhase',
      'description',
      'isPublished'
    ];
    const queryString = `document/${id}?fields=${this.buildValues(fields)}`;
    return this.http.get<Document[]>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Update a document with edited form data.
   *
   * @param {FormData} formData The form data to update the document with.
   * @param {string} _id The document to udpate.
   * @returns {Observable}
   */
  updateDocument(formData: FormData, _id: any): Observable<Document> {
    const queryString = `document/${_id}`;
    return this.http.put<Document>(`${this.pathAPI}/${queryString}`, formData, {});
  }

  /**
   * Delete a document.
   *
   * @param {Document} doc The document to delete.
   * @returns {Observable}
   */
  deleteDocument(doc: Document): Observable<Document> {
    const queryString = `document/${doc._id}`;
    return this.http.delete<Document>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Publish a document by toggling its visibility to "public" app users.
   *
   * @param {string} docId The document ID to publish.
   * @returns {Observable}
   */
  publishDocument(docId: String): Observable<Document> {
    const queryString = `document/${docId}/publish`;
    return this.http.put<Document>(`${this.pathAPI}/${queryString}`, {}, {});
  }

  /**
   * Unpublish a document by toggling its visibility to "public" app users.
   *
   * @param {string} docId The document ID to unpublish.
   * @returns {Observable}
   */
  unPublishDocument(docId: String): Observable<Document> {
    const queryString = `document/${docId}/unpublish`;
    return this.http.put<Document>(`${this.pathAPI}/${queryString}`, {}, {});
  }

  /**
   * Upload a new document.
   *
   * @param {FormData} formData The form data to upload the document with.
   * @returns {Observable}
   */
  uploadDocument(formData: FormData): Observable<Document> {
    const fields = [
      'documentFileName',
      'internalOriginalName',
      'displayName',
      'documentURLText',
      'internalURL',
      'internalMime'
    ];
    const queryString = `document?fields=${this.buildValues(fields)}`;
    return this.http.post<Document>(`${this.pathAPI}/${queryString}`, formData, {});
  }

  /**
   * Get a blob of data. Possibly a document(file), or CSV.
   *
   * @param {string} id The document ID to download with.
   * @returns {Promise}
   */
  private downloadResource(id: string): Promise<Blob> {
    const queryString = `document/${id}/download`;
    return this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();
  }

  /**
   * Initiate a download of a document. Get the reference to the document
   * dependending on whether or not it was added as part of a comment.
   *
   * @param {Document} document The document object to download.
   * @return {Promise}
   */
  public async downloadDocument(document: Document): Promise<void> {
    const blob = await this.downloadResource(document._id);
    let filename;
    if (document.documentSource === 'COMMENT') {
      filename = document.internalOriginalName;
    } else {
      filename = document.documentFileName;
    }
    filename = filename.replace(/\\/g, '_').replace(/\//g, '_');

    this.createDownloadFile(blob, filename);
  }

  /**
   * Get all document sections by project.
   *
   * @param {string} projectId The project ID to get document sections for.
   * @returns {Observable}
   */
  getDocumentSections(projectId: string): Observable<Object> {
    const fields = [
      'name',
      'project',
      'order',
    ];
    const queryString = `documentSection/${projectId}?fields=${this.buildValues(fields)}`;
    return this.http.get<DocumentSection>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Add document section to the DB.
   *
   * @param {DocumentSection} docSection The document section object to add.
   * @returns {Observable}
   */
  addDocumentSection(docSection: DocumentSection): Observable<DocumentSection> {
    const queryString = `documentSection/`;
    return this.http.post<DocumentSection>(`${this.pathAPI}/${queryString}`, docSection, {});
  }

  /**
   * Save a document section.
   *
   * @param {DocumentSection} docSection The document section to save.
   * @returns {Observable}
   */
  saveDocumentSection(docSection: DocumentSection): Observable<DocumentSection> {
    const queryString = `documentSection/${docSection._id}`;
    return this.http.put<DocumentSection>(`${this.pathAPI}/${queryString}`, docSection, {});
  }

  /**
   * Reorder the array of all document sections by updating the "order" value of each object.
   *
   * @param docSections The array of document sections to reorder.
   * @param projectId The project to reorder file/document sections in.
   * @returns An observable of an array of document sections.
   */
  reorderDocumentSections(docSections: DocumentSection[], projectId: string): Observable<DocumentSection[]> {
    const queryString = `documentSection/${projectId}`;
    return this.http.post<DocumentSection[]>(`${this.pathAPI}/${queryString}`, docSections, {});
  }

  /**
   * Get a CSV of all comments by comment period.
   *
   * @param {string} period The comment period to get comments for.
   * @return {Promise}
   */
  public async exportComments(period: String) {
    const queryString = `comment/export/${period}`;
    const blob = await this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();

    this.createDownloadFile(blob);
  }

  /**
   * Get a CSV of all survey responses by comment period and optionally, by
   * survey.
   *
   * @param {string} period The comment period to get comments for.
   * @param {string} surveyID The survey to get comments for.
   * @return {Promise}
   */
  public async exportSurveyResponses(period: String, surveyID?) {
    let surveyPath;
    surveyID ? surveyPath = `/survey/${surveyID}` : surveyPath = ''
    const queryString = `surveyResponse/export/${period}${surveyPath}`;
    const blob = await this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();

    this.createDownloadFile(blob);
  }

  /**
   * Get all email subscribers as a CSV export.
   *
   * @param {string} projectId The project ID to get subscribers by.
   * @return {Promise}
   */
  public async exportSubscribers(projectId: String) {
    const queryString = `emailSubscribe/export/${projectId}`;
    const blob = await this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();

    this.createDownloadFile(blob);
  }

  /**
   * Handle creation and download of file to browser.
   *
   * @param {any} blob The blob of data to download.
   * @param {string} docName The document(file) name to download.
   * @return {void}
   */
  public createDownloadFile(blob, docName?) {
    let filename;
    if (docName) {
      filename = docName;
    } else {
      // Filename should be date it was exported
      filename = `export_${new Date().toISOString().split('T')[0]}.csv`;
      filename = filename.replace(/\\/g, '_').replace(/\//g, '_');
    }


    if (this.isMS) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      window.document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
  }

  /**
   * Encode a document(file) and open it in the browser. Get the reference to
   * the document dependending on whether or not it was added as part of a comment.
   *
   * @param {Document} document The document to open.
   * @return {Promise}
   */
  public async openDocument(document: Document): Promise<void> {
    let filename;
    if (document.documentSource === 'COMMENT') {
      filename = document.internalOriginalName;
    } else {
      filename = document.documentFileName;
    }
    filename = encode(filename).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\\/g, '_').replace(/\//g, '_');
    window.open(this.pathAPI + '/document/' + document._id + '/fetch/' + filename, '_blank');
  }

  /**
   * Get item via search endpoint - can be any valid schema the app uses
   * (Project, Document, RecentActivity, etc.).
   *
   * @param {string} _id The ID of the item to retrieve.
   * @param {string} schema The schema type(Project, Document, RecentActivity, etc.).
   * @returns {Observable}
   */
  getItem(_id: string, schema: string): Observable<SearchResults[]> {
    let queryString = `search?dataset=Item&_id=${_id}&_schemaName=${schema}`;
    return this.http.get<SearchResults[]>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Search any schema. Return the exact fields and optionally paginate and sort
   * the results. You can also populate the search results(MongoDB operation).
   *
   * @param {string} keys The search keywords.
   * @param {string} dataset The schema to use(Project, Document, RecentActivity, etc.).
   * @param {Array} fields The fields to return on the object.
   * @param {number} pageNum The page number to paginate with.
   * @param {number} pageSize The page size to paginate with.
   * @param {string} sortBy The field to sort by.
   * @param {object} queryModifier Change the combination of fields to return by.
   * @param {boolean} populate Whether or not to populate the results.
   * @param {object} filter Filter to only include certain fields.
   * @returns {Observable}
   */
  searchKeywords(keys: string, dataset: string, fields: any[], pageNum: number, pageSize: number, sortBy: string = null, queryModifier: object = {}, populate = false, filter = {}): Observable<SearchResults[]> {
    let queryString = `search?dataset=${dataset}`;
    if (fields && fields.length > 0) {
      fields.forEach(item => {
        queryString += `&${item.name}=${item.value}`;
      });
    }
    if (keys) {
      queryString += `&keywords=${keys}`;
    }
    if (pageNum !== null) { queryString += `&pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { queryString += `&pageSize=${pageSize}`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `&sortBy=${sortBy}`; }
    if (populate !== null) { queryString += `&populate=${populate}`; }
    if (queryModifier !== {}) {
      Object.keys(queryModifier).forEach(key => {
        queryModifier[key].split(',').map(item => {
          queryString += `&and[${key}]=${item}`;
        });
      });
    }
    if (filter !== {}) {
      Object.keys(filter).forEach(key => {
        filter[key].split(',').map(item => {
          queryString += `&or[${key}]=${item}`;
        });
      });
    }
    queryString += `&fields=${this.buildValues(fields)}`;
    return this.http.get<SearchResults[]>(`${this.pathAPI}/${queryString}`, {});
  }

  //
  // Metrics
  //
  getMetrics(pageNum: number, pageSize: number, sortBy: string = null): Observable<SearchResults[]> {
    let queryString = `audit?`;
    let fields = ['fields',
      'performedBy',
      'deletedBy',
      'updatedBy',
      'addedBy',
      'meta',
      'action',
      'objId',
      'keywords',
      'timestamp',
      '_objectSchema'];

    if (pageNum !== null) { queryString += `pageNum=${pageNum - 1}&`; }
    if (pageSize !== null) { queryString += `pageSize=${pageSize}&`; }
    if (sortBy !== '' && sortBy !== null) { queryString += `sortBy=${sortBy}&`; }
    queryString += `fields=${this.buildValues(fields)}`;
    return this.http.get<SearchResults[]>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Get recent activity by ID. Return a select set of fields.
   *
   * @param {string} id The recent activity ID to get by.
   * @returns {Observable}
   */
  getRecentActivity(id: string): Observable<RecentActivity[]> {
    const fields = [
      '_id',
      'headline',
      'content',
      'dateAdded',
      'project',
      'pinned',
      'active',
      'contentUrl',
      'documentUrl',
      'documentUrlText'
    ];
    const queryString = `recentActivity/${id}?fields=${this.buildValues(fields)}`;
    return this.http.get<RecentActivity[]>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Add a new recent activity.
   *
   * @param {RecentActivity} recentActivity The new recent activity object to add.
   * @returns {Observable}
   */
  addRecentActivity(recentActivity: RecentActivity): Observable<RecentActivity> {
    const queryString = `recentActivity/`;
    return this.http.post<RecentActivity>(`${this.pathAPI}/${queryString}`, recentActivity, {});
  }

  /**
   * Save a recent activity.
   *
   * @param {RecentActivity} recentActivity The recent activity object to save.
   * @returns {Observable}
   */
  saveRecentActivity(recentActivity: RecentActivity): Observable<RecentActivity> {
    const queryString = `recentActivity/${recentActivity._id}`;
    return this.http.put<RecentActivity>(`${this.pathAPI}/${queryString}`, recentActivity, {});
  }

  /**
   * Delete a recent activity.
   *
   * @param {RecentActivity} recentActivity The recent activity object to delete.
   * @returns {Observable}
   */
  deleteRecentActivity(recentActivity: RecentActivity): Observable<RecentActivity> {
    const queryString = `recentActivity/${recentActivity._id}`;
    return this.http.delete<RecentActivity>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Get all email subscribers by project.
   *
   * @param {string} projectId The project ID to get subscribers for.
   * @returns {Observable}
   */
  getEmails(projectId: string): Observable<Object> {
    const fields = [
      'email',
      'project',
      'confirmed',
      'dateSubscribed',
      'dateConfirmed',
    ];
    const queryString = `emailSubscribe?project=${projectId}&fields=${this.buildValues(fields)}`;
    return this.http.get<EmailSubscribe>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Delete a single project email subscriber.
   *
   * @param {string} emailAddress The email address to remove the entry for.
   * @param {string} projectId The project ID it's subscribed to.
   * @returns {Observable}
   */
  deleteEmail(emailAddress: string, projectId: string): Observable<EmailSubscribe> {
    const fields = [
      'email',
    ];
    //const queryString = 'emailSubscribe?fields=' + this.buildValues(fields);
    const queryString = `emailSubscribe/${emailAddress}/project/${projectId}`;
    return this.http.delete<EmailSubscribe>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Save a user object.
   *
   * @param {User} user The user object to save.
   * @returns {Observable}
   */
  saveUser(user: User): Observable<User> {
    const queryString = `user/${user._id}`;
    return this.http.put<User>(`${this.pathAPI}/${queryString}`, user, {});
  }

  /**
   * Add a new user object.
   *
   * @param {User} user The new user object to add.
   * @returns {Observable}
   */
  addUser(user: User): Observable<User> {
    const queryString = `user/`;
    return this.http.post<User>(`${this.pathAPI}/${queryString}`, user, {});
  }

  /**
   * Get a single user and return a select set of fields.
   *
   * @param {string} userID The user ID to retrieve by.
   * @returns {Observable}
   */
  getUser(userID: string): Observable<User[]> {
    const fields = [
      'userID',
      'firstName',
      'lastName',
      'displayName',
      'email',
    ];
    const queryString = `user/${userID}?fields=${this.buildValues(fields)}`;
    return this.http.get<User[]>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Get all users - return a select set of fields.
   *
   * @returns {Observable}
   */
  getAllUsers(): Observable<Object> {
    const fields = [
      'sub',
      'idirUserGuid',
      'displayName',
      'projectPermissions',
    ];
    const queryString = `user?fields=${this.buildValues(fields)}`;
    return this.http.get<User>(`${this.pathAPI}/${queryString}`, {});
  }

  /**
   * Give a user permission to view/edit a project.
   *
   * @param {User} user The user to give permission to.
   * @param {Project} proj The project to give the user permission to access.
   * @returns {Observable}
   */
  addProjectToUser(user: User, proj: Project): Observable<User> {
    const queryString = `user/addPermission/${user._id}/${proj._id}`;
    return this.http.put<User>(`${this.pathAPI}/${queryString}`, user, {});
  }

  /**
   * Remove view/edit permissions of a project from a user.
   *
   * @param {User} user The user to remove permission on.
   * @param {Project} proj The project to remove access for.
   * @returns {Observable}
   */
  removeProjectFromUser(user: User, proj: Project): Observable<User> {
    const queryString = `user/removePermission/${user._id}/${proj._id}`;
    return this.http.put<User>(`${this.pathAPI}/${queryString}`, user, {});
  }

  //
  // Organizations
  //
  getOrgs(): Observable<Org[]> {
    const fields = [
      'displayName',
      'username',
      'firstName',
      'lastName'
    ];
    const queryString = `organization?fields=${this.buildValues(fields)}`;
    return this.http.get<Org[]>(`${this.pathAPI}/${queryString}`, {});
  }

  getOrg(id: any): Observable<Org> {
    const queryString = `organization/${id}`;
    return this.http.get<Org>(`${this.pathAPI}/${queryString}`, {});
  }

  saveOrg(org: Org): Observable<Org> {
    const queryString = `organization/${org._id}`;
    return this.http.put<Org>(`${this.pathAPI}/${queryString}`, org, {});
  }

  addOrg(org: Org): Observable<Org> {
    const queryString = `organization/`;
    return this.http.post<Org>(`${this.pathAPI}/${queryString}`, org, {});
  }

  /**
   * Helper function to build a collection of values into a URL query string.
   *
   * @param {Array} collection The array of fields to make into a query string.
   * @returns {string}
   */
  private buildValues(collection: any[]): string {
    let values = '';
    each(collection, function (a) {
      values += a + '|';
    });
    // trim the last |
    return values.replace(/\|$/, '');
  }
}
