import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtUtil } from 'app/jwt-util';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';
import { User } from 'app/models/user';

declare var Keycloak: any;

@Injectable()
export class KeycloakService {
  private keycloakAuth: any;
  private keycloakEnabled: boolean;
  private keycloakUrl: string;
  private keycloakRealm: string;
  private loggedOut: string;
  private pathAPI: string;

  constructor(
    private http: HttpClient
  ) {
    switch (window.location.origin) {
      case 'https://landuseplanning-test.apps.silver.devops.gov.bc.ca':
      case 'https://landuseplanning-dev.apps.silver.devops.gov.bc.ca':
        // Staging(Dev, Test).
        this.keycloakEnabled = true;
        this.keycloakUrl = "https://test.loginproxy.gov.bc.ca/auth";
        break;
      case 'https://landuseplanning.gov.bc.ca':
        // Prod.
        this.keycloakEnabled = true;
        this.keycloakUrl = "https://loginproxy.gov.bc.ca/auth";
        break;
      default:
        // Local development.
        this.keycloakEnabled = true;
        this.keycloakUrl = "https://dev.loginproxy.gov.bc.ca/auth";
    }

    // The following item is loaded by a file that is only present on cluster builds.
    // Locally, this will be empty and local defaults will be used.
    const remoteApiPath = window.localStorage.getItem('from_admin_server--remote_api_path');

    this.pathAPI = (_.isEmpty(remoteApiPath)) ? 'http://localhost:3000/api' : remoteApiPath;
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

  /**
   * Sets up configiruation for Keycloak adapter and initializes Keycloak. This
   * will check for an active session and if none is found, will redirect the user to
   * log in.
   *
   * Also adds an entry in the DB for user if they haven't logged in before.
   *
   * @returns Void if keycloak inits successfully.
   */
  init(): Promise<void> {
    this.loggedOut = this.getParameterByName('loggedout');

    const self = this;
    if (this.keycloakEnabled) {
      // Bootup KC.
      this.keycloakEnabled = true;
      return new Promise<void>((resolve, reject) => {
        const config = {
          url: this.keycloakUrl,
          realm: 'standard',
          clientId: "land-use-planning-4060"
        };

        self.keycloakAuth = new Keycloak(config);

        self.keycloakAuth.onAuthRefreshError = () => {
          self.keycloakAuth.login({ idpHint: 'idir' });
        };

        // Try to get refresh tokens in the background
        self.keycloakAuth.onTokenExpired = () => {
          self.keycloakAuth.updateToken(180)
            .success()
            .error(() => {
              self.keycloakAuth.login({ idpHint: 'idir' });
            });
        };

        self.keycloakAuth.init({
          // Specify the pkceMethod to be compatible with Common Hosted SSO.
          pkceMethod: 'S256',
          onLoad: 'check-sso',
          // Without this option, keycloak assumes we're logged out and dumps all tokens.
          checkLoginIframe: false
        })
          .success((auth) => {
            if (!auth) {
              if ('true' === this.loggedOut) {
                // Don't do anything, they wanted to remain logged out.
                resolve();
              } else {
                self.keycloakAuth.login({ idpHint: 'idir' });
              }
            } else {
              const userToken = self.keycloakAuth.tokenParsed;
              window.localStorage.setItem('currentUser', JSON.stringify({ username: userToken.displayName, token: userToken }));
              // After successful login, see if there's a user model for project permissions.
              this.checkUser(userToken)
                .subscribe(
                  userArray => {
                    if (0 === userArray.length) {
                      // If no user exists with this email, add them to the DB.
                      this.addNewUser(userToken)
                        .subscribe(() => {
                          resolve();
                        }, err => {
                          console.error('Could not add new user', err);
                          reject();
                        });
                    } else if (1 === userArray.length) {
                      const user = userArray[0];
                      if (user.idirUserGuid && "idir_user_guid" in userToken) {
                        if (user.idirUserGuid === userToken.idir_user_guid) {
                          resolve();
                        } else {
                          reject();
                        }
                      } else {
                        // If user exists in the DB, but their GUID doesn't match the token, update the GUID.
                        this.updateUserWithGuid(user, userToken)
                        .subscribe(
                          () => {
                            resolve();
                          },
                          err => {
                            console.error('Could not update the user', err);
                            reject();
                          }
                        );
                      }
                    } else {
                      reject();
                    }
                  },
                  err => console.error('Error retrieving user: ', err)
                );

              resolve();
            }
          })
          .error((err) => {
            console.error('Keycloak error. Error initializing', err);
            reject();
          });
      });
    }
  }

  /**
   * Queries the API for a DB entry for a user containing their email.
   *
   * @param {User} userToken User object to query with.
   * @returns {Observable<User[]>}
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
      const queryString = encodeURIComponent(userToken.email);
      return this.http.get<User[]>(`${this.pathAPI}/user/email/${queryString}?fields=${fields}`, {});
    }
  }

  /**
   * Add a new user object to the DB.
   *
   * @param {User} userToken The user to add.
   * @returns {Observable[<User>]}
   */
  addNewUser(userToken): Observable<User> {
    // Creating the user in the DB for the first time.
    const user = new User({
      idirUserGuid: userToken.idir_user_guid,
      firstName: userToken.given_name,
      lastName: userToken.family_name,
      displayName: `${userToken.given_name} ${userToken.family_name}`,
      email: userToken.email,
      projectPermissions: []
    });

    return this.http.post<User>(`${this.pathAPI}/user`, user, {});
  }

  /**
   * Takes the user's token, gets the GUID from it, and updates the user's
   * DB entry with it.
   *
   * @param {User} user The user object to add to.
   * @param {User} userToken The user token to get the GUID from.
   * @returns {Observable<User>}
   */
  updateUserWithGuid(user: User, userToken): Observable<User> {
      // Update user object with GUID.
      user.idirUserGuid = userToken.idir_user_guid;
      return this.http.put<User>(`${this.pathAPI}/user/${user._id}`, user, {});
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
    if (!this.keycloakEnabled) {
      // return the local storage token
      const currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
      return currentUser ? currentUser.token : null;
    }

    return this.keycloakAuth.token;
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
      this.keycloakAuth.updateToken(30)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(() => {
          console.error('KC refresh token error');
          observer.error();
        });

      return { unsubscribe() { } };
    });
  }

  getLogoutURL(): string {
    if (this.keycloakEnabled) {
      return this.keycloakAuth.authServerUrl + '/realms/' + this.keycloakRealm + '/protocol/openid-connect/logout?redirect_uri=' + window.location.origin + '/admin/not-authorized?loggedout=true';
    } else {
      // Go to the /login page.
      return window.location.origin + '/admin/login';
    }
  }
}
