import { Injectable } from '@angular/core';
import { Http, Response, ResponseContentType, RequestOptions, Headers } from '@angular/http';
import { Params, Router } from '@angular/router';
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Application } from 'app/models/application';
import { CommentPeriod } from 'app/models/commentperiod';
import { Comment } from 'app/models/comment';
import { Document } from 'app/models/document';
import { User } from 'app/models/user';

@Injectable()
export class ApiService {
  public token: string;
  pathAPI: string;
  params: Params;
  env: 'local' | 'dev' | 'test' | 'prod';

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

      case 'nrts-prc-admin-dev.pathfinder.gov.bc.ca':
        // Dev
        this.pathAPI = 'https://prc-api-dev.pathfinder.gov.bc.ca/api';
        this.env = 'dev';
        break;

      case 'nrts-prc-admin-test.pathfinder.gov.bc.ca':
        // Test
        this.pathAPI = 'https://prc-api-test.pathfinder.gov.bc.ca/api';
        this.env = 'test';
        break;

      default:
        // Prod
        this.pathAPI = 'https://';
        this.env = 'prod';
    };
  }

  ensureLoggedIn() {
    if (!this.token) {
      console.log('not logged in, redirecting');
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  //
  // Applications
  //
  getApplications() {
    const fields = [
      'name',
      'type',
      'subtype',
      'purpose',
      'subpurpose',
      '_proponent',
      'latitude',
      'longitude',
      'location',
      'region',
      'description',
      'legalDescription',
      'status',
      'projectDate',
      'businessUnit',
      'cl_files',
      'commodityType',
      'commodity',
      'tags',
      'commodities'
    ];
    let queryString = 'application?fields=';
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
      'name',
      'type',
      'subtype',
      'purpose',
      'subpurpose',
      '_proponent',
      'latitude',
      'longitude',
      'location',
      'region',
      'description',
      'legalDescription',
      'status',
      'projectDate',
      'businessUnit',
      'cl_files',
      'commodityType',
      'commodity',
      'commodities'
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

  addApplication(app: Application) {
    // console.log('Adding:', app);
    let queryString = 'application/';
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.post(this.pathAPI, queryString, app, { headers: headers });
  }

  publishApplication(app: Application) {
    let queryString = 'application/' + app._id + '/publish';
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, queryString, app, { headers: headers });
  }

  unPublishApplication(app: Application) {
    let queryString = 'application/' + app._id + '/unpublish';
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, queryString, app, { headers: headers });
  }

  saveApplication(app: Application) {
    const fields = [
      'name',
      'type',
      'subtype',
      'purpose',
      'subpurpose',
      '_proponent',
      'latitude',
      'longitude',
      'location',
      'region',
      'description',
      'legalDescription',
      'status',
      'projectDate',
      'businessUnit',
      'cl_files',
      'commodityType',
      'commodity',
      'commodities'
    ];
    let queryString = 'application/' + app._id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.put(this.pathAPI, queryString, app, { headers: headers });
  }

  uploadDocument(formData) {
    const fields = ['displayName',
    'internalURL',
    'documentFileName',
    'internalMime'];
    let queryString = 'document/?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.post(this.pathAPI, queryString, formData, { headers: headers });
  }

  downloadDocument(file) {
    const queryString = 'document/' + file._id + '/download';
    const headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.token});
    const options = new RequestOptions({responseType: ResponseContentType.Blob, headers });
    return this.http.get(this.pathAPI + '/' + queryString, options)
    .map(res => res.blob())
    .subscribe((obj: any) => {
      const blob = new Blob([obj], { type: file.internalMime });
      FileSaver.saveAs(blob, file.displayName);
    });
  }

  //
  // Organizations
  //
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
    const fields = ['_application', 'startDate', 'endDate', 'description'];
    let queryString = 'commentperiod/' + period._id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.delete(this.pathAPI, queryString, period, { headers: headers });
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
      '_documents',
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
      '_documents',
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
    // TODO: add comment documents
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

  //
  // Documents
  //
  getDocumentsByAppId(appId: string) {
    const fields = ['internalMime', 'displayName', 'documentFileName', '_application'];
    let queryString = 'document?_application=' + appId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString + appId, { headers: headers });
  }

  getDocument(id: string) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, 'document/' + id, { headers: headers });
  }

  deleteDocument(file: any) {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    // First delete the document, then attempt to save the new version of the application
    return this.delete(this.pathAPI, 'document/' + file._id, file, { headers: headers });
  }

  // TODO: saveDocument()

  //
  // Crown Lands file
  //
  getBCGWCrownLandsById(id: string) {
    const fields = ['name'];
    let queryString = 'public/search/bcgw/crownLandsId/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    return this.get(this.pathAPI, queryString, { headers: headers });
  }

  getBCGWDispositionTransactionId(id: string) {
    const fields = ['name'];
    let queryString = 'public/search/bcgw/dispositionTransactionId/' + id + '?fields=';
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

  public login(username: string, password: string): Observable<boolean> {
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

  public logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    localStorage.removeItem('currentUser');
  }

  public handleError(error: any) {
    const reason = error.message ? error.message : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    console.log(reason);
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
    // console.log('THIS:', `${ apiPath }/${ apiRoute }`, body || null, options || null);
    return this.http.post(`${apiPath}/${apiRoute}`, body || null, options || null);
  }
  private delete(apiPath: string, apiRoute: string, body?: Object, options?: Object) {
    // console.log('THIS:', `${ apiPath }/${ apiRoute }`, body || null, options || null);
    return this.http.delete(`${apiPath}/${apiRoute}`, options || null);
  }
}
