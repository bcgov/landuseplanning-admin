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
      // Always enable sso
      // case 'http://localhost:4200':
      //   // Local
      //   this.keycloakEnabled = false;
      //   break;

      case 'https://lup-dev.pathfinder.gov.bc.ca':
        // Dev etc
        this.keycloakEnabled = true;
        this.keycloakUrl = 'https://oidc.gov.bc.ca/auth';
        this.keycloakRealm = 'aaoozhcp';
        break;

      case 'https://lup-test.pathfinder.gov.bc.ca':
        // Test
        this.keycloakEnabled = true;
        this.keycloakUrl = 'https://test.oidc.gov.bc.ca/auth';
        this.keycloakRealm = 'aaoozhcp';
        break;

      default:
        // Prod
        this.keycloakEnabled = true;
        this.keycloakUrl = 'https://oidc.gov.bc.ca/auth';
        this.keycloakRealm = 'aaoozhcp';
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
      return new Promise((resolve, reject) => {
        const config = {
          url: this.keycloakUrl,
          realm: this.keycloakRealm,
          clientId: 'lup-admin-console'
        };

        // console.log('KC Auth init.');

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
          self.keycloakAuth.updateToken(180)
            .success(function (refreshed) {
              console.log('KC refreshed token?:', refreshed);
            })
            .error((err) => {
              console.log('onTokenExpired:KC refresh error:', err);
              self.keycloakAuth.login({ idpHint: 'idir' });
            });
        };

        // Initialize.
        self.keycloakAuth.init({})
          .success((auth) => {
            // console.log('KC Refresh Success?:', self.keycloakAuth.authServerUrl);
            console.log('KC Success:', auth);

            // After successful login, see if there's a user model for project permissions
            this.checkUser(self.keycloakAuth.tokenParsed);

            if (!auth) {
              if (this.loggedOut === 'true') {
                // Don't do anything, they wanted to remain logged out.
                resolve();
              } else {
                self.keycloakAuth.login({ idpHint: 'idir' });
              }
            } else {
              resolve();
            }
          })
          .error((err) => {
            console.log('KC error2:', err);
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
  checkUser(userToken: User): void {
    if (userToken) {
      const queryString = `user/${userToken.sub}`;
      this.http.get<User[]>(`${this.pathAPI}/${queryString}`, {})
      .subscribe(
        res => this.addUserIfNone(res, userToken),
        err => console.log('Error retrieving user: ', err)
      )
    }
  }

  /**
   * Checks if users is returned and adds a user entry if not
   *
   * @param userArray Array of users
   * @param userToken Keycloak parsed token
   * @return void
   */
  addUserIfNone(userArray: User[], userToken: User): void {
    if (userArray.length === 0) {
      console.log('User does not yet exist, adding: ', userArray)

      const user = new User({
        sub: userToken.sub,
        firstName: userToken.given_name,
        lastName: userToken.family_name,
        displayName: `${userToken.given_name} ${userToken.family_name}`,
        email: userToken.email
      });

      this.http.post<User>(`${this.pathAPI}/user`, user, {})
      .subscribe(
        res => console.log('Added new user', res),
        err => console.log('Error adding new user: ', err)
        )
      } else {
        console.log('User already exists', userArray)
      }
  }

  isValidForSite() {
    if (!this.getToken()) {
      return false;
    }
    const jwt = new JwtUtil().decodeToken(this.getToken());

    if (jwt && jwt.realm_access && jwt.realm_access.roles) {
      return _.includes(jwt.realm_access.roles, 'sysadmin');
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
      this.keycloakAuth
        .updateToken(30)
        .success(function (refreshed) {
          console.log('KC refreshed token?:', refreshed);
          observer.next();
          observer.complete();
        })
        .error(err => {
          console.log('KC refresh error:', err);
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
