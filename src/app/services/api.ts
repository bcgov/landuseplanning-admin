import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Params, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class Api {
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
    } else {
      return true;
    }
  }

  // Applications
  getApplications() {
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    // let options = new RequestOptions({ headers: headers });
    return this.getApps('application', { headers: headers});
  }

  getApplicationByCode(code: string) {
    return this.getApps('public/application/code/' + code);
  }

  getDocuments(id: string) {
    return this.get(this.pathAPI, 'public/documents/' + id);
  }

  // Methods
  getApps(apiRoute: string, options?: Object) {
    return this.get(this.pathAPI, apiRoute, options);
  }

  putApps(apiRoute: string, body?: Object, options?: Object) {
    return this.put(this.pathAPI, apiRoute, body, options);
  }

  login(username: string, password: string): Observable<boolean> {
      return this.http.post(`${ this.pathAPI }/login/token`, { username: username, password: password })
      .map((response: Response) => {
              // login successful if there's a jwt token in the response
              console.log('token:', response.json());
              const token = response.json() && response.json().accessToken;
              if (token) {
                  // set token property
                  this.token = token;

                  // store username and jwt token in local storage to keep user logged in between page refreshes
                  localStorage.setItem('currentUser', JSON.stringify({ username: username, token: token }));

                  // return true to indicate successful login
                  return true;
              } else {
                  // return false to indicate failed login
                  return false;
              }
          });
  }

  logout(): void {
      // clear token remove user from local storage to log user out
      this.token = null;
      localStorage.removeItem('currentUser');
  }

  handleError(error: any) {
    const reason = error.message ? error.message : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    console.log(reason);
    return Observable.throw(reason);
  }

  // Private

  private get(apiPath: string, apiRoute: string, options?: Object) {
    return this.http.get(`${ apiPath }/${ apiRoute }`, options || null);
  }

  private put(apiPath: string, apiRoute: string, body?: Object, options?: Object) {
    return this.http.put(`${ apiPath }/${ apiRoute }`, body || null, options || null);
  }

  private post(apiPath: string, apiRoute: string, body?: Object, options?: Object) {
    // console.log('THIS:', `${ apiPath }/${ apiRoute }`, body || null, options || null);
    return this.http.post(`${ apiPath }/${ apiRoute }`, body || null, options || null);
  }
}
