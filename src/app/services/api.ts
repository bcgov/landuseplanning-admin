import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { each, isEmpty } from 'lodash';

import { KeycloakService } from 'app/services/keycloak.service';

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

  handleError(error: any): Observable<never> {
    const reason = error.message ? (error.error ? `${error.message} - ${error.error.message}` : error.message) : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    console.log('API error =', reason);
    if (error && error.status === 403 && !this.keycloakService.isKeyCloakEnabled()) {
      window.location.href = '/admin/login';
    }
    return throwError(error);
  }

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

  logout() {
    // clear token + remove user from local storage to log user out
    this.token = null;
    window.localStorage.removeItem('currentUser');
  }

  //
  // Projects
  //
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

  getFullDataSet(dataSet: string): Observable<any> {
    return this.http.get<any>(`${this.pathAPI}/search?pageSize=1000&dataset=${dataSet}`, {});
  }

  // NB: returns array with 1 element
  getProject(id: string, cpStart: string, cpEnd: string): Observable<Project[]> {
    const fields = [
      'existingLandUsePlans',
      'centroid',
      'description',
      'details',
      'engagementStatus',
      'logos',
      'backgroundInfo',
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
      'delete'
    ];
    let queryString = `project/${id}?populate=true`;
    if (cpStart !== null) { queryString += `&cpStart[since]=${cpStart}`; }
    if (cpEnd !== null) { queryString += `&cpEnd[until]=${cpEnd}`; }
    queryString += `&fields=${this.buildValues(fields)}`;
    return this.http.get<Project[]>(`${this.pathAPI}/${queryString}`, {});
  }

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

  addProject(proj: Project): Observable<Project> {
    const queryString = `project/`;
    return this.http.post<Project>(`${this.pathAPI}/${queryString}`, proj, {});
  }

  publishProject(proj: Project): Observable<Project> {
    const queryString = `project/${proj._id}/publish`;
    return this.http.put<Project>(`${this.pathAPI}/${queryString}`, proj, {});
  }

  unPublishProject(proj: Project): Observable<Project> {
    const queryString = `project/${proj._id}/unpublish`;
    return this.http.put<Project>(`${this.pathAPI}/${queryString}`, proj, {});
  }

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

  saveProject(proj: Project): Observable<Project> {
    const queryString = `project/${proj._id}`;
    return this.http.put<Project>(`${this.pathAPI}/${queryString}`, proj, {});
  }

  // //
  // // Features
  // //
  // getFeaturesByTantalisId(tantalisId: number): Observable<Feature[]> {
  //   const fields = [
  //     'type',
  //     'tags',
  //     'geometry',
  //     'geometryName',
  //     'properties',
  //     'isDeleted',
  //     'projectID'
  //   ];
  //   const queryString = `feature?isDeleted=false&tantalisId=${tantalisId}&fields=${this.buildValues(fields)}`;
  //   return this.http.get<Feature[]>(`${this.pathAPI}/${queryString}`, {});
  // }

  // getFeaturesByProjectId(projectId: string): Observable<Feature[]> {
  //   const fields = [
  //     'type',
  //     'tags',
  //     'geometry',
  //     'geometryName',
  //     'properties',
  //     'isDeleted',
  //     'projectID'
  //   ];
  //   const queryString = `feature?isDeleted=false&projectId=${projectId}&fields=${this.buildValues(fields)}`;
  //   return this.http.get<Feature[]>(`${this.pathAPI}/${queryString}`, {});
  // }

  // deleteFeaturesByProjectId(projectID: string): Observable<Object> {
  //   const queryString = `feature/?projectID=${projectID}`;
  //   return this.http.delete(`${this.pathAPI}/${queryString}`, {});
  // }

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

  //
  // Surveys
  //
  addSurvey(survey): Observable<any> {
    const queryString = `survey/`;
    return this.http.post<any>(`${this.pathAPI}/${queryString}`, survey, {});
  }

  deleteSurvey(survey: Survey): Observable<Survey> {
    const queryString = `survey/${survey._id}`;
    return this.http.delete<Survey>(`${this.pathAPI}/${queryString}`, {});
  }

  // NB: returns array with 1 element
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

  saveSurvey(survey: Survey): Observable<Survey> {
    const queryString = `survey/${survey._id}`;
    return this.http.put<Survey>(`${this.pathAPI}/${queryString}`, survey, {});
  }

  //
  // Survey Responses
  //

  getSurveyResponse(id: string, populateNextComment: boolean): Observable<any> {
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
    // if (populateNextComment) { queryString += '&populateNextComment=true'; }
    return this.http.get<any>(`${this.pathAPI}/${queryString}`, { observe: 'response' });
  }

  getResponsesByPeriodId(periodId: string, pageNum: number, pageSize: number, sortBy: string, count: boolean, filter: object): Observable<Object> {
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
    // if (filter !== {}) {
    //   Object.keys(filter).forEach(key => {
    //     queryString += `&${key}=${filter[key]}`;
    //   });
    // }
    queryString += `&fields=${this.buildValues(fields)}`;

    return this.http.get<Object>(`${this.pathAPI}/${queryString}`, {});
  }


  getResponsesByProjId(projId: string): Observable<Object> {
    const fields = [
      'project'
    ];

    let queryString = `surveyResponse?&project=${projId}&`;
    queryString += `count=true&`;
    queryString += `fields=${this.buildValues(fields)}`;

    return this.http.get<Object>(`${this.pathAPI}/${queryString}`, {});
  }

  //
  // Comment Periods
  //
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

  // NB: returns array with 1 element
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

  addCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/`;
    return this.http.post<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, {});
  }

  saveCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/${period._id}`;
    return this.http.put<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, {});
  }

  deleteCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/${period._id}`;
    return this.http.delete<CommentPeriod>(`${this.pathAPI}/${queryString}`, {});
  }

  publishCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/${period._id}/publish`;
    return this.http.put<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, {});
  }

  unPublishCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const queryString = `commentperiod/${period._id}/unpublish`;
    return this.http.put<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, {});
  }

  //
  // Comments
  //
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

    console.log('the query string', queryString)

    return this.http.get<Object>(`${this.pathAPI}/${queryString}`, {});
  }

  // NB: returns array with 1 element
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

  addComment(comment: Comment): Observable<Comment> {
    const queryString = `comment/`;
    return this.http.post<Comment>(`${this.pathAPI}/${queryString}`, comment, {});
  }

  saveComment(comment: Comment): Observable<Comment> {
    const queryString = `comment/${comment._id}`;
    return this.http.put<Comment>(`${this.pathAPI}/${queryString}`, comment, {});
  }

  updateCommentStatus(comment: Comment, status: string): Observable<Comment> {
    const queryString = `comment/${comment._id}/status`;
    return this.http.put<Comment>(`${this.pathAPI}/${queryString}`, { 'status': status }, {});
  }

  //
  // Documents
  //
  getDocumentsByAppId(projId: string): Observable<Document[]> {
    const fields = [
      '_project',
      'documentFileName',
      'displayName',
      'internalURL',
      'internalMime'
    ];
    const queryString = `document?isDeleted=false&_project=${projId}&fields=${this.buildValues(fields)}`;
    return this.http.get<Document[]>(`${this.pathAPI}/${queryString}`, {});
  }

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

  // NB: returns array with 1 element
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

  updateDocument(formData: FormData, _id: any): Observable<Document> {
    const queryString = `document/${_id}`;
    return this.http.put<Document>(`${this.pathAPI}/${queryString}`, formData, {});
  }

  deleteDocument(doc: Document): Observable<Document> {
    const queryString = `document/${doc._id}`;
    return this.http.delete<Document>(`${this.pathAPI}/${queryString}`, {});
  }

  publishDocument(docId: String): Observable<Document> {
    const queryString = `document/${docId}/publish`;
    return this.http.put<Document>(`${this.pathAPI}/${queryString}`, {}, {});
  }

  unPublishDocument(docId: String): Observable<Document> {
    const queryString = `document/${docId}/unpublish`;
    return this.http.put<Document>(`${this.pathAPI}/${queryString}`, {}, {});
  }

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

  private downloadResource(id: string): Promise<Blob> {
    const queryString = `document/${id}/download`;
    return this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();
  }

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

  public async exportComments(period: String) {
    const queryString = `comment/export/${period}`;
    const blob = await this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();

    this.createDownloadFile(blob);
  }

  public async exportSurveyResponses(period: String, surveyID?) {
    let surveyPath;
    surveyID ? surveyPath = `/survey/${surveyID}` : surveyPath = ''
    const queryString = `surveyResponse/export/${period}${surveyPath}`;
    const blob = await this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();

    this.createDownloadFile(blob);
  }

  public async exportSubscribers(projectId: String) {
    const queryString = `emailSubscribe/export/${projectId}`;
    const blob = await this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();

    this.createDownloadFile(blob);
  }

  //
  // Handle creation and download of file to browser
  //
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

  //
  // Get Item via search endpoint
  //
  getItem(_id: string, schema: string): Observable<SearchResults[]> {
    let queryString = `search?dataset=Item&_id=${_id}&_schemaName=${schema}`;
    return this.http.get<SearchResults[]>(`${this.pathAPI}/${queryString}`, {});
  }

  //
  // Searching
  //
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
    console.log(queryString);
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

  // Activity
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

  addRecentActivity(recentActivity: RecentActivity): Observable<RecentActivity> {
    const queryString = `recentActivity/`;
    return this.http.post<RecentActivity>(`${this.pathAPI}/${queryString}`, recentActivity, {});
  }

  saveRecentActivity(recentActivity: RecentActivity): Observable<RecentActivity> {
    const queryString = `recentActivity/${recentActivity._id}`;
    return this.http.put<RecentActivity>(`${this.pathAPI}/${queryString}`, recentActivity, {});
  }

  deleteRecentActivity(recentActivity: RecentActivity): Observable<RecentActivity> {
    const queryString = `recentActivity/${recentActivity._id}`;
    return this.http.delete<RecentActivity>(`${this.pathAPI}/${queryString}`, {});
  }

  //
  // Email subscribe
  //
  getEmails(projectId: string): Observable<Object> {
    const fields = [
      'email',
      'project',
      'confirmed',
      'dateSubscribed',
      'dateConfirmed',
    ];
    //const queryString = 'emailSubscribe?fields=' + this.buildValues(fields);
    const queryString = `emailSubscribe?project=${projectId}&fields=${this.buildValues(fields)}`;
    console.log('the request', `emailSubscribe?fields=${this.buildValues(fields)}`)
    return this.http.get<EmailSubscribe>(`${this.pathAPI}/${queryString}`, {});
  }

  deleteEmail(emailAddress: string, projectId: string): Observable<EmailSubscribe> {
    console.log('Delete email API', emailAddress, projectId);
    const fields = [
      'email',
    ];
    //const queryString = 'emailSubscribe?fields=' + this.buildValues(fields);
    const queryString = `emailSubscribe/${emailAddress}/project/${projectId}`;
    console.log(this.pathAPI, '/', queryString);
    return this.http.delete<EmailSubscribe>(`${this.pathAPI}/${queryString}`, {});
  }


  //
  // Users
  //
  saveUser(user: User): Observable<User> {
    const queryString = `user/${user._id}`;
    return this.http.put<User>(`${this.pathAPI}/${queryString}`, user, {});
  }

  addUser(user: User): Observable<User> {
    const queryString = `user/`;
    return this.http.post<User>(`${this.pathAPI}/${queryString}`, user, {});
  }

  // NB: returns array with 1 element
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

  getAllUsers(): Observable<Object> {
    const fields = [
      'sub',
      'displayName',
      'projectPermissions',
    ];
    const queryString = `user?fields=${this.buildValues(fields)}`;
    return this.http.get<User>(`${this.pathAPI}/${queryString}`, {});
  }

  addProjectToUser(user: User, proj: Project): Observable<User> {
    const queryString = `user/addPermission/${user._id}/${proj._id}`;
    return this.http.put<User>(`${this.pathAPI}/${queryString}`, user, {});
  }

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

  //
  // Local helpers
  //
  private buildValues(collection: any[]): string {
    let values = '';
    each(collection, function (a) {
      values += a + '|';
    });
    // trim the last |
    return values.replace(/\|$/, '');
  }
}
