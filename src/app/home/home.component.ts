import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {
  numApplications: number;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private applicationService: ApplicationService,
    private api: ApiService
  ) { }

  ngOnInit() {
    // if we're not logged in, redirect
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    // although we aren't currently using numApplications,
    // this verifies our login token and redirects in case of error
    this.applicationService.getCount()
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        value => { this.numApplications = value; },
        error => {
          console.log('error =', 'could not count applications');
          this.router.navigate(['login']);
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
