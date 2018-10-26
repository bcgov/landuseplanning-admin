import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { JwtUtil } from 'app/jwt-util';

declare var Keycloak: any;

@Injectable()
export class KeycloakService {
  private keycloakAuth: any;
  private keycloakEnabled: boolean;
  private keycloakUrl: string;
  private keycloakRealm: string;

  constructor() {
    switch (window.location.origin) {
      case 'http://localhost:4200':
        // Local
        this.keycloakEnabled = false;
        break;

      case 'https://nrts-prc-demo.pathfinder.gov.bc.ca':
      case 'https://nrts-prc-scale.pathfinder.gov.bc.ca':
      case 'https://nrts-prc-beta.pathfinder.gov.bc.ca':
      case 'https://nrts-prc-master.pathfinder.gov.bc.ca':
      case 'https://nrts-prc-dev.pathfinder.gov.bc.ca':
        // Dev
        this.keycloakEnabled = true;
        this.keycloakUrl = 'https://sso-dev.pathfinder.gov.bc.ca/auth';
        this.keycloakRealm = 'prc';
        break;

      case 'https://nrts-prc-test.pathfinder.gov.bc.ca':
        // Test
        this.keycloakEnabled = true;
        this.keycloakUrl = 'https://sso-test.pathfinder.gov.bc.ca/auth';
        this.keycloakRealm = 'acrfd';
        break;

      default:
        // Prod
        this.keycloakEnabled = true;
        this.keycloakUrl = 'https://sso.pathfinder.gov.bc.ca/auth';
        this.keycloakRealm = 'acrfd';
    }
  }

  isKeyCloakEnabled(): boolean {
    return this.keycloakEnabled;
  }

  init(): Promise<any> {
    const self = this;
    if (this.keycloakEnabled) {
      // Bootup KC
      this.keycloakEnabled = true;
      return new Promise((resolve, reject) => {
        const config = {
          url: this.keycloakUrl,
          realm: this.keycloakRealm,
          clientId: 'prc-admin-console'
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
        };

        self.keycloakAuth.onAuthLogout = function () {
          // console.log('onAuthLogout');
        };

        // Try to get refresh tokens in the background
        self.keycloakAuth.onTokenExpired = function () {
          console.log('onTokenExpired, attempting to refresh.');
          self.keycloakAuth.updateToken()
            .success(function (auth) {
              console.log('KC Refresh Success?:', auth);
            })
            .error((err) => {
              console.log('KC error:', err);
            });
        };

        // Initialize.
        // self.keycloakAuth.init({ onLoad: `'login-required' })
        self.keycloakAuth.init({  })
          .success((auth) => {
            // console.log('KC Refresh Success?:', self.keycloakAuth.authServerUrl);
            console.log('KC Success:', auth);
            resolve();
          })
          .error((err) => {
            console.log('KC error:', err);
            reject();
          });
      });
    }
  }

  isValidForSite(token: any) {
    if (!token) {
      return false;
    }
    const jwt = new JwtUtil().decodeToken(token);

    if (jwt && jwt.realm_access && jwt.realm_access.roles) {
      return _.includes(jwt.realm_access.roles, 'sysadmin');
    } else {
      return false;
    }
  }

  forceAttemptUpdateToken() {
    if (this.keycloakEnabled) {
      const self = this;

      // If we have a token, try to refresh it
      const currentToken = this.getToken();
      // console.log("currentToken:", currentToken);
      if (currentToken !== undefined) {
        this.keycloakAuth.updateToken()
        .success(function (auth) {
          return true;
        })
        .error((err) => {
          console.log('KC error:', err);
          return false;
        });
      } else {
        // Just attempt idir.
        this.keycloakAuth.login({ idpHint: 'idir' });
      }
    } else {
      // console.log('redir to login');
      window.location.href = window.location.origin + '/admin/login';
    }
  }

  getToken(): string {
    // console.log('getToken:', this.keycloakAuth);
    if (this.keycloakEnabled) {
      return this.keycloakAuth.token; // returns undefined if present
    } else {
      // return the local storage token
      const currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
      return currentUser ? currentUser.token : null;
    }
  }

  getLogoutURL(): string {
    // TODO? need to do two stage logoff.
    // logoff prc, as well as bcgov?
    // https://logon.gov.bc.ca/clp-cgi/logoff.cgi?returl=http://localhost:4200/admin/
    // https://logontest.gov.bc.ca/clp-cgi/logoff.cgi?returl=http://localhost:4200/admin/
    if (this.keycloakEnabled) {
      return this.keycloakAuth.authServerUrl + '/realms/' + this.keycloakRealm + '/protocol/openid-connect/logout?redirect_uri=' + window.location.origin + '/admin/';
    } else {
      // go to the /login page
      return window.location.origin + '/admin/login';
    }
  }
}
