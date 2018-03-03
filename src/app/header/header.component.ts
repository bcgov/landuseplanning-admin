import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from '../services/api';
import { JwtUtil } from '../jwt-util';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {
  welcomeMsg: String;
  private _api: ApiService;
  private jwt: {
    username: String,
    scopes: Array<String>
  };

  constructor(private api: ApiService, private router: Router) {
    this._api = api;
    router.events.subscribe((val) => {
      // TODO: Change this to observe the change in the _api.token
      if (val instanceof NavigationEnd && val.url !== '/login' && this._api.token) {
        const jwt = new JwtUtil().decodeToken(this._api.token);
        this.welcomeMsg = 'Hello ' + jwt.username;
        this.jwt = jwt;
      } else {
        this.welcomeMsg = 'Login';
        this.jwt = null;
      }
      // console.log('val:', val instanceof NavigationEnd);
    });
  }

  renderMenu(route: String) {
    // Sysadmin's get administration.
    if (route === 'administration') {
      return (this.jwt && this.jwt.scopes.find(x => x === 'sysadmin'));
    }
  }
}
