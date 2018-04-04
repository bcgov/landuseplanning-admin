import { Injectable } from '@angular/core';
import { Http, Response, ResponseContentType, RequestOptions, Headers } from '@angular/http';
import { Params, Router } from '@angular/router';
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Application } from 'app/models/application';
// import { Organization } from 'app/models/organization';
import { Decision } from 'app/models/decision';
import { CommentPeriod } from 'app/models/commentperiod';
import { Comment } from 'app/models/comment';
import { Document } from 'app/models/document';
import { User } from 'app/models/user';

@Injectable()
export class ApiService {
  public token: string;
  pathAPI: string;
  params: Params;
  env: 'local' | 'dev' | 'test' | 'demo' | 'prod';

  constructor(private http: Http, private router: Router) {
    const { hostname } = window.location;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
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

        default:
        // Prod
        this.pathAPI = 'https://comment.nrs.gov.bc.ca/api';
        this.env = 'prod';
    };
  }

  ensureLoggedIn() {
    if (!this.token) {
      console.log('not logged in, redirecting');
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post(`${this.pathAPI}/login/token`, { username: username, password: password })
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        const token = response.json() && response.json().accessToken;
        if (token) {
          // set token property
          this.token = token;

          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify({ username: username, token: token }));

          return true; // successful login
        }
        return false; // failed login
      });
  }

  logout() {
    // clear token + remove user from local storage to log user out
    this.token = null;
    localStorage.removeItem('currentUser');
  }

  //
  // Applications
  //
  getApplications() {
    const fields = [
      '_id',
      'id',

      '_addedBy',
      '_updatedBy',
      'dateAdded',
      'dateUpdated',

      'agency',
      'areaHectares',
      'businessUnit',
      'cl_file',
      'code',
      'name',
      'client',
      'description',
      'interestID',
      'internalID',
      'legalDescription',
      'location',
      'latitude',
      'longitude',
      'mapsheet',
      'postID',
      'publishDate',
      'purpose',
      'subpurpose',
      'region',
      'status',
      'tenureStage',
      'tantalisID',
      'type',
      'subtype',

      'internal'
    ];
    let queryString = 'application?isDeleted=false&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  getApplication(id: string) {
    const fields = [
      '_id',
      'id',

      '_addedBy',
      '_updatedBy',
      'dateAdded',
      'dateUpdated',

      'agency',
      'areaHectares',
      'businessUnit',
      'cl_file',
      'code',
      'name',
      'client',
      'description',
      'interestID',
      'internalID',
      'legalDescription',
      'location',
      'latitude',
      'longitude',
      'mapsheet',
      'postID',
      'publishDate',
      'purpose',
      'subpurpose',
      'region',
      'status',
      'tenureStage',
      'tantalisID',
      'type',
      'subtype',

      'internal'
    ];
    let queryString = 'application/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  // for now, this is just a quick lookup by Tantalis ID
  getApplicationByTantalisId(tantalisId: number) {
    const queryString = 'application?isDeleted=false&tantalisId=' + tantalisId;
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  addApplication(app: Application) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.post(this.pathAPI, 'application/', app, { headers: headers });
  }

  publishApplication(app: Application) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, 'application/' + app._id + '/publish', null, { headers: headers });
  }

  unPublishApplication(app: Application) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, 'application/' + app._id + '/unpublish', null, { headers: headers });
  }

  deleteApplication(app: Application) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.delete(this.pathAPI, 'application/' + app._id, null, { headers: headers });
  }

  saveApplication(app: Application) {
    const fields = [
      // '_addedBy',
      // '_updatedBy',
      // 'dateAdded',
      // 'dateUpdated',

      'agency',
      'areaHectares',
      'businessUnit',
      'cl_file',
      'code',
      'name',
      'client',
      'description',
      'interestID',
      'internalID',
      'legalDescription',
      'location',
      'latitude',
      'longitude',
      'mapsheet',
      'postID',
      'publishDate',
      'purpose',
      'subpurpose',
      'region',
      'status',
      'tenureStage',
      'tantalisID',
      'type',
      'subtype',

      'internal'
    ];
    let queryString = 'application/' + app._id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Remove features since we don't really save them in the back-end, they are
    // referencial.
    if (app.features) {
      delete app.features;
    }
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, queryString, app, { headers: headers });
  }

  //
  // Organizations
  //
  getOrganizations() {
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
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }
  getOrganization(id: string) {
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
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  //
  // Decisions
  //
  getDecisionByAppId(appId: string) {
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
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  getDecision(id: string) {
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
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  addDecision(decision: Decision) {
    const fields = ['_application', 'description'];
    let queryString = 'decision?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.post(this.pathAPI, queryString, decision, { headers: headers });
  }

  saveDecision(decision: Decision) {
    const fields = ['_application', 'description'];
    let queryString = 'decision/' + decision._id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, queryString, decision, { headers: headers });
  }

  deleteDecision(decision: Decision) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.delete(this.pathAPI, 'decision/' + decision._id, null, { headers: headers });
  }

  publishDecision(decision: Decision) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, 'decision/' + decision._id + '/publish', null, { headers: headers });
  }

  unPublishDecision(decision: Decision) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, 'decision/' + decision._id + '/unpublish', null, { headers: headers });
  }

  //
  // Comment Periods
  //
  getPeriodsByAppId(appId: string) {
    const fields = [
      '_addedBy',
      '_application',
      'startDate',
      'endDate',
      'description',
      'internal'
    ];
    let queryString = 'commentperiod?isDeleted=false&_application=' + appId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  getPeriod(id: string) {
    const fields = [
      '_addedBy',
      '_application',
      'startDate',
      'endDate',
      'description',
      'internal'
    ];
    let queryString = 'commentperiod/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  addCommentPeriod(period: CommentPeriod) {
    const fields = ['_application', 'startDate', 'endDate', 'description'];
    let queryString = 'commentperiod?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.post(this.pathAPI, queryString, period, { headers: headers });
  }

  saveCommentPeriod(period: CommentPeriod) {
    const fields = ['_application', 'startDate', 'endDate', 'description'];
    let queryString = 'commentperiod/' + period._id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, queryString, period, { headers: headers });
  }

  deleteCommentPeriod(period: CommentPeriod) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.delete(this.pathAPI, 'commentperiod/' + period._id, null, { headers: headers });
  }

  publishCommentPeriod(period: CommentPeriod) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, 'commentperiod/' + period._id + '/publish', null, { headers: headers });
  }

  unPublishCommentPeriod(period: CommentPeriod) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, 'commentperiod/' + period._id + '/unpublish', null, { headers: headers });
  }

  //
  // Comments
  //
  getCommentsByPeriodId(periodId: string) {
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
    let queryString = 'comment?isDeleted=false&_commentPeriod=' + periodId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  getComment(id: string) {
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
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  addComment(comment: Comment) {
    const fields = ['comment', 'commentAuthor'];
    let queryString = 'comment?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.post(this.pathAPI, queryString, comment, { headers: headers });
  }

  saveComment(comment: Comment) {
    const fields = ['review', 'commentStatus'];
    let queryString = 'comment/' + comment._id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, queryString, comment, { headers: headers });
  }

  publishComment(comment: Comment) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, 'comment/' + comment._id + '/publish', null, { headers: headers });
  }

  unPublishComment(comment: Comment) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, 'comment/' + comment._id + '/unpublish', null, { headers: headers });
  }

  //
  // Documents
  //
  getDocumentsByAppId(appId: string) {
    const fields = ['_application', 'documentFileName', 'displayName', 'internalURL', 'internalMime'];
    let queryString = 'document?isDeleted=false&_application=' + appId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  getDocumentsByCommentId(commentId: string) {
    const fields = ['_comment', 'documentFileName', 'displayName', 'internalURL', 'internalMime'];
    let queryString = 'document?isDeleted=false&_comment=' + commentId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  getDocumentsByDecisionId(decisionId: string) {
    const fields = ['_decision', 'documentFileName', 'displayName', 'internalURL', 'internalMime'];
    let queryString = 'document?isDeleted=false&_decision=' + decisionId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  getDocument(id: string) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, 'document/' + id, { headers: headers });
  }

  deleteDocument(file: any) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.delete(this.pathAPI, 'document/' + file._id, null, { headers: headers });
  }

  publishDocument(file: any) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, 'document/' + file._id + '/publish', null, { headers: headers });
  }

  unPublishDocument(file: any) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, 'document/' + file._id + '/unpublish', null, { headers: headers });
  }

  uploadDocument(formData) {
    const fields = ['documentFileName', 'displayName', 'internalURL', 'internalMime'];
    let queryString = 'document/?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.post(this.pathAPI, queryString, formData, { headers: headers });
  }

  downloadDocument(document: Document): Subscription {
    return this.getDocumentBlob(document)
      .subscribe((value: Blob) => {
        const blob = new Blob([value], { type: document.internalMime });
        FileSaver.saveAs(blob, document.documentFileName);
      });
  }

  openDocument(document: Document): Subscription {
    const tab = window.open();
    return this.getDocumentBlob(document)
      .subscribe((value: Blob) => {
        const fileURL = URL.createObjectURL(value);
        tab.location.href = fileURL;
      });
  }

  private getDocumentBlob(document: Document): Observable<Blob> {
    const queryString = 'document/' + document._id + '/download';
    const headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.token });
    const options = new RequestOptions({ responseType: ResponseContentType.Blob, headers });
    return this.http.get(this.pathAPI + '/' + queryString, options)
      .map((value: Response) => {
        return new Blob([value.blob()], { type: document.internalMime });
      });
  }

  //
  // Crown Lands files
  //
  getBCGWCrownLands(id: string) {
    const fields = ['name', 'isImported'];
    let queryString = 'public/search/bcgw/crownLandsId/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  getBCGWDispositionByTransactionId(transactionId: number) {
    const fields = ['name'];
    let queryString = 'public/search/bcgw/dispositionTransactionId/' + transactionId + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  getClientsInfoByDispositionId(dispositionId: number) {
    const fields = ['name'];
    let queryString = 'public/search/bcgw/getClientsInfoByDispositionId/' + dispositionId + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
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
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  saveUser(user: User) {
    const fields = ['displayName', 'username', 'firstName', 'lastName'];
    let queryString = 'user/' + user._id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, queryString, user, { headers: headers });
  }

  addUser(user: User) {
    const fields = ['displayName', 'username', 'firstName', 'lastName'];
    let queryString = 'user?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.post(this.pathAPI, queryString, user, { headers: headers });
  }

  handleError(error: any): ErrorObservable {
    const reason = error.message ? error.message : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    console.log('API error =', reason);
    return Observable.throw(reason);
  }

  //
  // Private
  //
  private get(apiPath: string, apiRoute: string, options?: Object) {
    return this.http.get(`${apiPath}/${apiRoute}`, options || null);
  }

  private put(apiPath: string, apiRoute: string, body?: Object, options?: Object) {
    return this.http.put(`${apiPath}/${apiRoute}`, body || null, options || null);
  }

  private post(apiPath: string, apiRoute: string, body?: Object, options?: Object) {
    return this.http.post(`${apiPath}/${apiRoute}`, body || null, options || null);
  }
  private delete(apiPath: string, apiRoute: string, body?: Object, options?: Object) {
    return this.http.delete(`${apiPath}/${apiRoute}`, options || null);
  }
}
