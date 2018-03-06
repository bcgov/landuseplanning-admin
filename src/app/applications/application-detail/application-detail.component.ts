import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as moment from 'moment-timezone';

import { Application } from 'app/models/application';
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})

export class ApplicationDetailComponent implements OnInit, OnDestroy {
  public application: Application;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService, // also used in template
    public applicationService: ApplicationService, // used in template
    private commentPeriodService: CommentPeriodService, // used in template
  ) { }

  ngOnInit(): void {
    // if we're not logged in, redirect
    if (!this.api.ensureLoggedIn()) {
      return; // return false;
    }

    // get data directly from resolver
    this.application = this.route.snapshot.data.application;
    console.log('this.application =', this.application);

    // application not found --> navigate back to application list
    if (!this.application || !this.application._id) {
      alert('Uh-oh, application not found');
      this.router.navigate(['/applications']);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public gotoMap(): void {
    // pass along the id of the current application if available
    // so that the map component can show the popup for it.
    const applicationId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: applicationId }]);
  }

  getDaysRemaining(): string {
    const today = new Date();
    const days = moment(this.application.currentPeriod.endDate).diff(moment(today), 'days') + 1;
    return (days === 1) ? (days + ' Day Remaining') : (days + ' Days Remaining');
  }

  getPendingComments(): string {
    let count: number;
    count = 0;
    return (count === 1) ? (count + ' Pending Comment') : (count + ' Pending Comments');
  }
}
