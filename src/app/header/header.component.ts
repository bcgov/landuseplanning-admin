import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { ApiService } from 'app/services/api';
import { JwtUtil } from 'app/jwt-util';
import { KeycloakService } from 'app/services/keycloak.service';
import { ConfirmComponent } from 'app/confirm/confirm.component';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('toggleNav', [
      state('navClosed', style({
        height: '0',
      })),
      state('navOpen', style({
        height: '*',
      })),
      transition('navOpen => navClosed', [
        animate('0.2s')
      ]),
      transition('navClosed => navOpen', [
        animate('0.2s')
      ]),
    ]),
  ]
})

export class HeaderComponent implements OnInit, OnDestroy {
  isNavMenuOpen = false;
  welcomeMsg: String;
  private _api: ApiService;
  public jwt: {
    username: String,
    client_roles: string[],
    scopes: Array<String>
  };
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private api: ApiService,
    private ngxSmartModalService: NgxSmartModalService,
    private keycloakService: KeycloakService,
    private modalService: NgbModal,
    public router: Router
  ) {
    this._api = api;
    router.events
      .takeUntil(this.ngUnsubscribe)
      .subscribe(val => {
        const token = this.keycloakService.getToken();
        // TODO: Change this to observe the change in the _api.token
        if (token) {
          const jwt = new JwtUtil().decodeToken(token);
          this.welcomeMsg = jwt ? ('Hello ' + jwt.preferred_username) : 'Login';
          this.jwt = jwt;
        } else {
          this.welcomeMsg = 'Login';
          this.jwt = null;
        }
      });
  }

  ngOnInit() {
    // Make sure they have the right role.
    if (!this.keycloakService.isValidForSite()) {
      this.router.navigate(['/not-authorized']);
    }

    let isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
    if (isIEOrEdge) {
        this.ngxSmartModalService.setModalData({
          type: null,
          title: 'Browser Incompatible',
          message: '<strong>  Attention: </strong>This website is not supported by Internet Explorer and Microsoft Edge, please use Google Chrome or Firefox.',
        }, 'confirmation-modal');
        this.ngxSmartModalService.open('confirmation-modal');
    }

  }

  renderMenu(route: String) {
    // Sysadmin's get administration.
    if (route === 'administration') {
      return (this.jwt && this.jwt.client_roles.find(x => x === 'sysadmin') && this.jwt.username === 'admin');
    }
  }

  navigateToLogout() {
    // reset login status
    this.api.logout();
    window.location.href = this.keycloakService.getLogoutURL();
  }

  toggleNav() {
    this.isNavMenuOpen = !this.isNavMenuOpen;
  }

  closeNav() {
    this.isNavMenuOpen = false;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
