import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';
import { KeycloakService } from 'app/services/keycloak.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-login',
  moduleId: module.id,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  model: any = {};
  loading = false;
  error = '';

  constructor(private router: Router, private api: ApiService, private keycloakService: KeycloakService) {}

  /**
   * Check if keycloak is enabled and if so, redirect the user to the root of the app.
   * 
   * @return {void}
   */
  ngOnInit(): void {
    // Redirect to the main index page if they try to get here.
    if (this.keycloakService.isKeyCloakEnabled()) {
      this.router.navigate(['/']);
    }
  }

  login() {
    this.loading = true;

    this.api.login(this.model.username, this.model.password)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        result => {
          if (result === true) {
            // login successful
            this.router.navigate(['/']);
          }
        },
        error => {
          console.error(error);
          this.error = 'Username or password is incorrect';
          this.loading = false;
        }
      );
  }

  /**
   * Terminate subscriptions when component is unmounted.
   *
   * @return {void}
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
