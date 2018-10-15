import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Params, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { Subscription } from 'rxjs/Subscription';
import { throwError } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';
import { JwtHelperService } from '@auth0/angular-jwt';

import { SearchResults } from 'app/models/search';

import { Application } from 'app/models/application';
// import { Organization } from 'app/models/organization';
import { Decision } from 'app/models/decision';
import { CommentPeriod } from 'app/models/commentperiod';
import { Comment } from 'app/models/comment';
import { Document } from 'app/models/document';
import { User } from 'app/models/user';
import { Feature } from 'app/models/feature';
import { Organization } from 'app/models/organization';
import { Client } from 'app/models/client';
import { KeycloakService } from 'app/services/keycloak.service';

interface LocalLoginResponse {
  _id: string;
  title: string;
  created_at: string;
  startTime: string;
  endTime: string;
  state: boolean;
  accessToken: string;
}


@Injectable()
export class ApiService {
  public token: string;
  public isMS: boolean; // IE, Edge, etc
  private jwtHelper: JwtHelperService;
  pathAPI: string;
  params: Params;
  env: 'local' | 'dev' | 'test' | 'demo' | 'scale' | 'beta' | 'master' | 'prod';

  constructor(private http: HttpClient,
              private router: Router,
              private keycloakService: KeycloakService
              ) {
    this.jwtHelper = new JwtHelperService();
    const currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.isMS = window.navigator.msSaveOrOpenBlob ? true : false;
    const { hostname } = window.location;
    switch (hostname) {
      case 'localhost':
        // Local
        this.pathAPI = 'http://localhost:3000/api';
        this.env = 'local';
        break;

      case 'nrts-prc-dev.pathfinder.gov.bc.ca':
        // Dev
        this.pathAPI = 'https://nrts-prc-dev.pathfinder.gov.bc.ca/api';
        this.env = 'dev';
        break;

      case 'nrts-prc-test.pathfinder.gov.bc.ca':
        // Test
        this.pathAPI = 'https://nrts-prc-test.pathfinder.gov.bc.ca/api';
        this.env = 'test';
        break;

      case 'nrts-prc-demo.pathfinder.gov.bc.ca':
        // Demo
        this.pathAPI = 'https://nrts-prc-demo.pathfinder.gov.bc.ca/api';
        this.env = 'demo';
        break;

      case 'nrts-prc-scale.pathfinder.gov.bc.ca':
        // Scale
        this.pathAPI = 'https://nrts-prc-scale.pathfinder.gov.bc.ca/api';
        this.env = 'scale';
        break;

      case 'nrts-prc-beta.pathfinder.gov.bc.ca':
        // Beta
        this.pathAPI = 'https://nrts-prc-beta.pathfinder.gov.bc.ca/api';
        this.env = 'beta';
        break;

      case 'nrts-prc-master.pathfinder.gov.bc.ca':
        // Master
        this.pathAPI = 'https://nrts-prc-master.pathfinder.gov.bc.ca/api';
        this.env = 'master';
        break;

      default:
        // Prod
        this.pathAPI = 'https://comment.nrs.gov.bc.ca/api';
        this.env = 'prod';
    };
  }

  handleError(error: any): Observable<any> {
    const reason = error.message ? error.message : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    console.log('API error =', reason);
    return throwError(error);
  }

  ensureLoggedIn() {
    const token = this.keycloakService.getToken();
    if (!token || this.jwtHelper.isTokenExpired(token)) {
      console.log('not logged in, redirecting');
      return this.keycloakService.forceAttemptUpdateToken();
    }
    return true;
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<LocalLoginResponse>(`${this.pathAPI}/login/token`, { username: username, password: password })
      .map((response: LocalLoginResponse) => {
        // login successful if there's a jwt token in the response
        if (response.accessToken) {
          // set token property
          this.token = response.accessToken;

          // store username and jwt token in local storage to keep user logged in between page refreshes
          window.localStorage.setItem('currentUser', JSON.stringify({ username: username, token: this.token }));
          return true; // successful login
        } else {
          return false; // failed login
        }
      });
  }

  logout() {
    // clear token + remove user from local storage to log user out
    this.token = null;
    window.localStorage.removeItem('currentUser');
  }

  //
  // Applications
  //
  getApplications(): Observable<Application[]> {
    const fields = [
      'agency',
      'areaHectares',
      'businessUnit',
      'centroid',
      'cl_file',
      'client',
      'description',
      'internal',
      'legalDescription',
      'location',
      'name',
      'publishDate',
      'purpose',
      'status',
      'subpurpose',
      'subtype',
      'tantalisID',
      'tenureStage',
      'type'
    ];
    let queryString = 'application?isDeleted=false&pageNum=0&pageSize=1000000&fields='; // max 1M records
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    // const params = new HttpParams().set('page', '1');
    // const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.http.get<Application[]>(`${this.pathAPI}/${queryString}`, { });
  }

  getApplication(id: string): Observable<Application> {
    const fields = [
      'agency',
      'areaHectares',
      'businessUnit',
      'centroid',
      'cl_file',
      'client',
      'description',
      'internal',
      'legalDescription',
      'location',
      'name',
      'publishDate',
      'purpose',
      'status',
      'subpurpose',
      'subtype',
      'tantalisID',
      'tenureStage',
      'type'
  ];
    const queryString = `application/${id}?isDeleted=false&fields=${this.buildValues(fields)}`;
    return this.http.get<Application>(`${this.pathAPI}/${queryString}`, { });
  }

  getApplicationByTantalisID(tantalisID: number) {
    const fields = [
      'agency',
      'areaHectares',
      'businessUnit',
      'centroid',
      'cl_file',
      'client',
      'description',
      'internal',
      'legalDescription',
      'location',
      'name',
      'publishDate',
      'purpose',
      'status',
      'subpurpose',
      'subtype',
      'tantalisID',
      'tenureStage',
      'type'
    ];
    // NB: API uses 'tantalisId' (even though elsewhere it's 'tantalisID')
    const queryString = `application?isDeleted=false&tantalisId=${tantalisID}&fields=${this.buildValues(fields)}`;
    // const params = new HttpParams().set('page', '1');
    return this.http.get<Application>(`${this.pathAPI}/${queryString}`, { });
  }

  addApplication(app: Application) {
    const queryString = 'application/';
    return this.http.post<Application>(`${this.pathAPI}/${queryString}`, app, { });
  }

  publishApplication(app: Application) {
    const queryString = 'application/' + app._id + '/publish';
    return this.http.put<Application>(`${this.pathAPI}/${queryString}`, app, { });
  }

  unPublishApplication(app: Application) {
    const queryString = 'application/' + app._id + '/unpublish';
    return this.http.put<Application>(`${this.pathAPI}/${queryString}`, app, { });
  }

  deleteApplication(app: Application) {
    const queryString = 'application/' + app._id;
    return this.http.delete<Application>(`${this.pathAPI}/${queryString}`, { });
  }

  saveApplication(app: Application) {
    // TODO: this should be used to specify desired return fields
    // NB: this applies to all POSTs and PUTs in this module

    const fields = [
      'agency',
      'areaHectares',
      'businessUnit',
      'centroid',
      'cl_file',
      'client',
      'description',
      'internal',
      'legalDescription',
      'location',
      'name',
      'publishDate',
      'purpose',
      'status',
      'subpurpose',
      'subtype',
      'tantalisID',
      'tenureStage',
      'type'
    ];
    let queryString = 'application/' + app._id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.put<Application>(`${this.pathAPI}/${queryString}`, app, { });
  }

  //
  // Features
  //
  getFeaturesByTantalisId(tantalisID: number): Observable<Feature[]> {
    const fields = [
      'type',
      'tags',
      'geometry',
      'geometryName',
      'properties',
      'isDeleted',
      'applicationID'
    ];
    const queryString = `feature?isDeleted=false&tantalisId=${tantalisID}&fields=${this.buildValues(fields)}`;
    return this.http.get<Feature[]>(`${this.pathAPI}/${queryString}`, { });
  }

  getFeaturesByApplicationId(applicationId: string): Observable<Feature[]> {
    const fields = [
      'type',
      'tags',
      'geometry',
      'geometryName',
      'properties',
      'isDeleted',
      'applicationID'
    ];
    const queryString = `feature?isDeleted=false&applicationId=${applicationId}&fields=${this.buildValues(fields)}`;
    return this.http.get<Feature[]>(`${this.pathAPI}/${queryString}`, { });
  }

  deleteFeaturesByApplicationId(applicationId: string) {
    const queryString = 'feature/?applicationID=' + applicationId;
    return this.http.delete(`${this.pathAPI}/${queryString}`, { });
  }

  //
  // Organizations
  //
  getOrganizations(): Observable<Organization[]> {
    const fields = [
      '_addedBy',
      'code',
      'name'
    ];
    let queryString = 'organization?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.get<Organization[]>(`${this.pathAPI}/${queryString}`, { });
  }

  getOrganization(id: string): Observable<Organization> {
    const fields = [
      '_addedBy',
      'code',
      'name'
    ];
    let queryString = 'organization/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.get<Organization>(`${this.pathAPI}/${queryString}`, { });
  }

  //
  // Decisions
  //
  getDecisionByAppId(appId: string): Observable<Decision[]> {
    const fields = [
      '_addedBy',
      '_application',
      'code',
      'name',
      'description'
    ];
    let queryString = 'decision?_application=' + appId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.get<Decision[]>(`${this.pathAPI}/${queryString}`, { });
  }

  getDecision(id: string): Observable<Decision> {
    const fields = [
      '_addedBy',
      '_application',
      'code',
      'name',
      'description'
    ];
    let queryString = 'decision/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.get<Decision>(`${this.pathAPI}/${queryString}`, { });
  }

  addDecision(decision: Decision): Observable<Decision> {
    const fields = ['_application', 'description'];
    let queryString = 'decision?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.post<Decision>(`${this.pathAPI}/${queryString}`, decision, { });
  }

  saveDecision(decision: Decision): Observable<Decision> {
    const fields = ['_application', 'description'];
    let queryString = 'decision/' + decision._id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.put<Decision>(`${this.pathAPI}/${queryString}`, decision, { });
  }

  deleteDecision(decision: Decision): Observable<Decision> {
    let queryString = 'decision/' + decision._id;
    return this.http.delete<Decision>(`${this.pathAPI}/${queryString}`, { });
  }

  publishDecision(decision: Decision) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let queryString = 'decision/' + decision._id + '/publish';
    return this.http.put<Decision>(`${this.pathAPI}/${queryString}`, decision, { });
  }

  unPublishDecision(decision: Decision) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let queryString = 'decision/' + decision._id + '/unpublish';
    return this.http.put<Decision>(`${this.pathAPI}/${queryString}`, decision, { });
  }

  //
  // Comment Periods
  //
  getPeriodsByAppId(appId: string): Observable<CommentPeriod[]> {
    const fields = [
      '_addedBy',
      '_application',
      'startDate',
      'endDate'
    ];
    let queryString = 'commentperiod?isDeleted=false&_application=' + appId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.get<CommentPeriod[]>(`${this.pathAPI}/${queryString}`, { });
  }

  getPeriod(id: string): Observable<CommentPeriod> {
    const fields = [
      '_addedBy',
      '_application',
      'startDate',
      'endDate'
    ];
    let queryString = 'commentperiod/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.get<CommentPeriod>(`${this.pathAPI}/${queryString}`, { });
  }

  addCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const fields = ['_application', 'startDate', 'endDate', 'description'];
    let queryString = 'commentperiod?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.post<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, { });
  }

  saveCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    const fields = ['_application', 'startDate', 'endDate', 'description'];
    let queryString = 'commentperiod/' + period._id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.put<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, { });
  }

  deleteCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    let queryString = 'commentperiod/' + period._id;
    return this.http.delete<CommentPeriod>(`${this.pathAPI}/${queryString}`, { });
  }

  publishCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    let queryString = 'commentperiod/' + period._id + '/publish';
    return this.http.put<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, { });
  }

  unPublishCommentPeriod(period: CommentPeriod): Observable<CommentPeriod> {
    let queryString = 'commentperiod/' + period._id + '/unpublish';
    return this.http.put<CommentPeriod>(`${this.pathAPI}/${queryString}`, period, { });
  }

  //
  // Comments
  //
  getCommentsByPeriodIdNoFields(periodId: string): Observable<Comment[]>  {
    const queryString = `comment?isDeleted=false&_commentPeriod=${periodId}&pageNum=0&pageSize=1000000`; // max 1M records
    return this.http.get<Comment[]>(`${this.pathAPI}/${queryString}`, { });
  }

  getCommentsByPeriodId(periodId: string, pageNum: number, pageSize: number, sortBy: string) {
    const fields = [
      '_addedBy',
      '_commentPeriod',
      'commentNumber',
      'comment',
      'commentAuthor',
      'review',
      'dateAdded',
      'commentStatus'
    ];

    let queryString = `comment?isDeleted=false&_commentPeriod=${periodId}&`;
    if (pageNum !== null) { queryString += `pageNum=${pageNum}&`; }
    if (pageSize !== null) { queryString += `pageSize=${pageSize}&`; }
    if (sortBy !== null) { queryString += `sortBy=${sortBy}&`; }
    queryString += `fields=${this.buildValues(fields)}`;

    return this.http.get(`${this.pathAPI}/${queryString}`, { });
  }

  getComment(id: string): Observable<Comment[]> {
    const fields = [
      '_addedBy',
      '_commentPeriod',
      'commentNumber',
      'comment',
      'commentAuthor',
      'review',
      'dateAdded',
      'commentStatus'
    ];
    let queryString = 'comment/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.get<Comment[]>(`${this.pathAPI}/${queryString}`, { });
  }

  addComment(comment: Comment): Observable<Comment> {
    const fields = ['comment', 'commentAuthor'];
    let queryString = 'comment?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.post<Comment>(`${this.pathAPI}/${queryString}`, comment, { });
  }

  saveComment(comment: Comment): Observable<Comment> {
    const fields = ['review', 'commentStatus'];
    let queryString = 'comment/' + comment._id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.put<Comment>(`${this.pathAPI}/${queryString}`, comment, { });
  }

  publishComment(comment: Comment): Observable<Comment> {
    let queryString = 'comment/' + comment._id + '/publish';
    return this.http.put<Comment>(`${this.pathAPI}/${queryString}`, null, { });
  }

  unPublishComment(comment: Comment): Observable<Comment> {
    let queryString = 'comment/' + comment._id + '/unpublish';
    return this.http.put<Comment>(`${this.pathAPI}/${queryString}`, null, { });
  }

  //
  // Documents
  //
  getDocumentsByAppId(appId: string): Observable<Document[]> {
    const fields = ['_application', 'documentFileName', 'displayName', 'internalURL', 'internalMime'];
    let queryString = 'document?isDeleted=false&_application=' + appId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.get<Document[]>(`${this.pathAPI}/${queryString}`, { });
  }

  getDocumentsByCommentId(commentId: string): Observable<Document[]> {
    const fields = ['_comment', 'documentFileName', 'displayName', 'internalURL', 'internalMime'];
    let queryString = 'document?isDeleted=false&_comment=' + commentId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.get<Document[]>(`${this.pathAPI}/${queryString}`, { });
  }

  getDocumentsByDecisionId(decisionId: string): Observable<Document[]> {
    const fields = ['_decision', 'documentFileName', 'displayName', 'internalURL', 'internalMime'];
    let queryString = 'document?isDeleted=false&_decision=' + decisionId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.get<Document[]>(`${this.pathAPI}/${queryString}`, { });
  }

  getDocument(id: string) {
    let queryString = 'document/' + id;
    return this.http.get<Document>(`${this.pathAPI}/${queryString}`, { });
  }

  deleteDocument(file: any) {
    let queryString = 'document/' + file._id
    return this.http.delete<Document>(`${this.pathAPI}/${queryString}`, { });
  }

  publishDocument(file: any) {
    let queryString = 'document/' + file._id + '/publish';
    return this.http.put<Document>(`${this.pathAPI}/${queryString}`, file, { });
  }

  unPublishDocument(file: any) {
    let queryString = 'document/' + file._id + '/unpublish';
    return this.http.put<Document>(`${this.pathAPI}/${queryString}`, file, { });
  }

  uploadDocument(formData: FormData) {
    const fields = ['documentFileName', 'displayName', 'internalURL', 'internalMime'];
    let queryString = 'document/?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.post<Document>(`${this.pathAPI}/${queryString}`, formData, { });
  }

  public async downloadResource(id: string): Promise<Blob> {
    const queryString = 'document/' + id + '/download';
    const file = await this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json'}).toPromise();
    return file;
  }

  public async downloadFile(document: Document): Promise<void> {
    const blob = await this.downloadResource(document._id);
    const filename = document.documentFileName;

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

  public async openFile(document: Document): Promise<void> {
    const blob = await this.downloadResource(document._id);
    const filename = document.documentFileName;
    if (this.isMS) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const tab = window.open();
      const fileURL = URL.createObjectURL(blob);
      tab.location.href = fileURL;
    }
  }

  //
  // Searching
  //
  getAppsByCLID(clid: string) {
    const queryString = 'public/search/bcgw/crownLandsId/' + clid;
    return this.http.get<SearchResults>(`${this.pathAPI}/${queryString}`, { });
  }

  getAppsByDTID(dtid: number) {
    const queryString = 'public/search/bcgw/dispositionTransactionId/' + dtid;
    return this.http.get<SearchResults>(`${this.pathAPI}/${queryString}`, { });
  }

  getClientsByDTID(dtid: number) {
    const queryString = 'public/search/bcgw/getClientsInfoByDispositionId/' + dtid;
    return this.http.get<SearchResults>(`${this.pathAPI}/${queryString}`, { });
  }

  //
  // Users
  //
  getAllUsers() {
    const fields = ['displayName', 'username', 'firstName', 'lastName'];
    let queryString = 'user?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.get<User[]>(`${this.pathAPI}/${queryString}`, { });
  }

  saveUser(user: User) {
    const fields = ['displayName', 'username', 'firstName', 'lastName'];
    let queryString = 'user/' + user._id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.put<User>(`${this.pathAPI}/${queryString}`, user, { });
  }

  addUser(user: User) {
    const fields = ['displayName', 'username', 'firstName', 'lastName'];
    let queryString = 'user?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.http.post<User>(`${this.pathAPI}/${queryString}`, user, { });
  }

  //
  // Local helpers
  //
  private buildValues(collection: any[]): string {
    let values = '';
    _.each(collection, function (a) {
      values += a + '|';
    });
    // trim the last |
    return values.replace(/\|$/, '');
  }
}
