import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { JwtUtil } from 'app/jwt-util';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';
import { UserService } from 'app/services/user.service';
import { User } from 'app/models/user';

declare var Keycloak: any;

@Injectable()
export class KeycloakService {
  public keycloakAuth: any;
  private keycloakEnabled: boolean;
  private keycloakUrl: string;
  private keycloakRealm: string;
  private loggedOut: string;
  private pathAPI: string;

  constructor(
    private http: HttpClient
  ) {
    switch (window.location.origin) {
      case 'https://lup-dev.pathfinder.gov.bc.ca':
      case 'https://lup-dev.pathfinder.gov.bc.ca':
        // Staging(Dev, Test).
        this.keycloakEnabled = true;
        this.keycloakUrl = 'https://oidc.gov.bc.ca/auth';
        break;

      case 'https://lup-test.pathfinder.gov.bc.ca':
        // Prod.
        this.keycloakEnabled = true;
        this.keycloakUrl = 'https://test.oidc.gov.bc.ca/auth';
        break;

      default:
        // Local development.
        this.keycloakEnabled = true;
        this.keycloakUrl = 'https://dev.loginproxy.gov.bc.ca/auth';
    }

    // The following item is loaded by a file that is only present on cluster builds.
    // Locally, this will be empty and local defaults will be used.
    const remote_api_path = window.localStorage.getItem('from_admin_server--remote_api_path');

    this.pathAPI = (_.isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;
  }

  isKeyCloakEnabled(): boolean {
    return this.keycloakEnabled;
  }

  private getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) {
      return null;
    }
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  init(): Promise<any> {

    this.loggedOut = this.getParameterByName('loggedout');

    const self = this;
    if (this.keycloakEnabled) {
      // Bootup KC
      this.keycloakEnabled = true;
      return new Promise<void>((resolve, reject) => {
        const config = {
          url: this.keycloakUrl,
          realm: 'standard',
          clientId: "land-use-planning-4060"
        };

        self.keycloakAuth = new Keycloak(config);

        self.keycloakAuth.onAuthSuccess = function () {
          // console.log('onAuthSuccess');
        };

        self.keycloakAuth.onAuthError = function () {
          console.log('onAuthError');
        };

        self.keycloakAuth.onAuthRefreshSuccess = function () {
          // console.log('onAuthRefreshSuccess');
        };

        self.keycloakAuth.onAuthRefreshError = function () {
          console.log('onAuthRefreshError');
          self.keycloakAuth.login({ idpHint: 'idir' });
        };

        self.keycloakAuth.onAuthLogout = function () {
          // console.log('onAuthLogout');
        };

        // Try to get refresh tokens in the background
        self.keycloakAuth.onTokenExpired = function () {
          console.log('the token just expired, tryign update')
          self.keycloakAuth.updateToken(290)
            .success(function (refreshed) {
              console.log('KC refreshed token?:', refreshed);
            })
            .error((err) => {
              console.log('onTokenExpired:KC refresh error:', err);
              self.keycloakAuth.login({ idpHint: 'idir' });
            });
        };

        self.keycloakAuth.init({
          // Specify the pkceMethod to be compatible with Common Hosted SSO.
          pkceMethod: 'S256'
        })
          .success((auth) => {
            if (!auth) {
              if (this.loggedOut === 'true') {
                // Don't do anything, they wanted to remain logged out.
                resolve();
              } else {
                self.keycloakAuth.login({ idpHint: 'idir' });
              }
            } else {
              console.log('KC Success:', self.keycloakAuth);
              const userToken = self.keycloakAuth.tokenParsed;
              window.localStorage.setItem('currentUser', JSON.stringify({ username: userToken.displayName, token: this.keycloakAuth.token }));

              // After successful login, see if there's a user model for project permissions
              this.checkUser(userToken)
                .subscribe(
                  userArray => {
                    if (0 === userArray.length) {
                      this.addNewUser(userToken)
                        .subscribe(res => {
                          resolve()
                        }, err => {
                          console.log('Could not add new user', err);
                          reject();
                        });
                    } else if (1 === userArray.length) {
                      const user = userArray[0];
                      if (user.idir_user_guid && user.idir_user_guid === userToken.idir_user_guid) {
                        resolve();
                      } else {
                        this.updateUserWithGuid(user, userToken)
                        .subscribe(
                          res => {
                            resolve();
                          },
                          err => {
                            console.log('Could not update the user', err);
                            reject();
                          }
                        );
                      }
                    } else {
                      reject();
                    }
                  },
                  err => console.log('Error retrieving user: ', err)
                );

              resolve();
            }
          })
          .error((err) => {
            console.log('KC error:', err);
            reject();
          });
      });
    }
  }

  /**
   * Checks if user exists by .sub
   *
   * @param userToken User
   * @returns void
   */
  checkUser(userToken: User): Observable<User[]> {
    if (userToken && userToken.email) {
      let fields = [
        '_id',
        '_schemaName',
        'firstName',
        'lastName',
        'displayName',
        'email',
        'project',
        'projectPermissions',
        'read',
        'write',
        'delete',
      ].join('|');
      const queryString = encodeURIComponent(`user/${userToken.email}`);
      return this.http.get<User[]>(`${this.pathAPI}/${queryString}/email?fields=${fields}`, {});
    }
  }

  addNewUser(userToken: User): Observable<User> {
    // Creating the user in the DB for the first time.
    // Empty project permissions.
    const user = new User({
      idir_user_guid: userToken.idir_user_guid,
      firstName: userToken.given_name,
      lastName: userToken.family_name,
      displayName: `${userToken.given_name} ${userToken.family_name}`,
      email: userToken.email,
      projectPermissions: []
    });

    return this.http.post<User>(`${this.pathAPI}/user`, user, {});
  }

  updateUserWithGuid(user, userToken) {
      // Update user with GUID
      user.idir_user_guid = userToken.idir_user_guid;
      return this.http.put<User>(`${this.pathAPI}/user/${user._id}/_id`, user, {});
  }

  allTokens() {
    const self = this;

    return [
      self.keycloakAuth.token,
      self.keycloakAuth.idToken,
      self.keycloakAuth.refreshToken
    ]
  }

  isValidForSite() {
    if (!this.getToken()) {
      return false;
    }
    const jwt = new JwtUtil().decodeToken(this.getToken());

    if (jwt && jwt.client_roles) {
      return _.includes(jwt.client_roles, 'sysadmin');
    } else {
      return false;
    }
  }

  /**
   * Returns the current keycloak auth token.
   *
   * @returns {string} keycloak auth token.
   * @memberof KeycloakService
   */
  getToken(): string {
    const currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
    return currentUser ? currentUser.token : null;
  }

  /**
   * Returns an observable that emits when the auth token has been refreshed.
   * Call {@link KeycloakService#getToken} to fetch the updated token.
   *
   * @returns {Observable<string>}
   * @memberof KeycloakService
   */
  refreshToken(): Observable<any> {
    return new Observable(observer => {
      console.log('keycloak auth updateToken', this.keycloakAuth)
      this.keycloakAuth.updateToken(30)
        .then((refreshed) => {
          console.log('KC refreshed token?:', refreshed);
          observer.next();
          observer.complete();
        })
        .catch(() => {
          console.log('KC refresh error');
          observer.error();
        });

      return { unsubscribe() { } };
    });
  }

  getLogoutURL(): string {
    // https://logon.gov.bc.ca/clp-cgi/logoff.cgi?returl=http://localhost:4200/admin/
    // https://logontest.gov.bc.ca/clp-cgi/logoff.cgi?returl=http://localhost:4200/admin/
    if (this.keycloakEnabled) {
      return this.keycloakAuth.authServerUrl + '/realms/' + this.keycloakRealm + '/protocol/openid-connect/logout?redirect_uri=' + window.location.origin + '/admin/not-authorized?loggedout=true';
    } else {
      // go to the /login page
      return window.location.origin + '/admin/login';
    }
  }
}
