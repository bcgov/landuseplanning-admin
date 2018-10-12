import { Injectable } from '@angular/core';

declare var Keycloak: any;

@Injectable()
export class KeycloakService {
  private keycloakAuth: any;
  private keycloakEnabled: boolean;

  constructor() {
    if (window.location.origin === 'http://localhost:4200') {
      this.keycloakEnabled = false;
    } else {
      this.keycloakEnabled = true;
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
          url: 'https://sso-dev.pathfinder.gov.bc.ca/auth',
          realm: 'prc',
          clientId: 'prc-admin-console'
        };

        console.log('KC Auth init.');

        self.keycloakAuth = new Keycloak(config);

        self.keycloakAuth.onAuthSuccess = function() {
          console.log('onAuthSuccess');
        };

        self.keycloakAuth.onAuthError = function() {
          console.log('onAuthError');
        };

        self.keycloakAuth.onAuthRefreshSuccess  = function() {
          console.log('onAuthRefreshSuccess');
        };

        self.keycloakAuth.onAuthRefreshError  = function() {
          console.log('onAuthRefreshError');
        };

        self.keycloakAuth.onAuthLogout  = function() {
          console.log('onAuthLogout');
        };

        // Try to get refresh tokens in the background
        self.keycloakAuth.onTokenExpired  = function() {
          console.log('onTokenExpired, attempting to refresh.');
          self.keycloakAuth.updateToken()
          .success(function (auth) {
            console.log('KC Refresh Success?:', self.keycloakAuth.authServerUrl);
          })
          .error((err) => {
            console.log('KC error:', err);
          });
        };

        // Initialize.
        self.keycloakAuth.init({ onLoad: 'login-required' })
        .success((auth) => {
            console.log('KC Refresh Success?:', self.keycloakAuth.authServerUrl);
            console.log('KC Success:', auth);
          resolve();
        })
        .error((err) => {
          console.log('KC error:', err);
          reject();
        });
      });
    }
  };

  forceAttemptUpdateToken() {
    if (this.keycloakEnabled) {
      console.log('updating KC Token');
      const self = this;
      this.keycloakAuth.updateToken()
      .success(function (auth) {
        console.log('KC Refresh Success?:', self.keycloakAuth.authServerUrl);
        return true;
      })
      .error((err) => {
        console.log('KC error:', err);
        return false;
      });
    } else {
      console.log('redir to login');
      window.location.href = window.location.origin + '/admin/login';
    }
  }

  getToken(): string {
    // console.log('getToken:', this.keycloakAuth);
    if (this.keycloakEnabled) {
      return this.keycloakAuth.token;
    } else {
      // return the local storage token
      const currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
      return currentUser ? currentUser.token : null;
    }
  }

  getLogoutURL(): string {
    if (this.keycloakEnabled) {
      return this.keycloakAuth.authServerUrl + '/realms/prc/protocol/openid-connect/logout?redirect_uri=' + window.location.origin + '/admin/';
    } else {
      // go to the /login page
      return window.location.origin + '/admin/login';
    }
  }
}
