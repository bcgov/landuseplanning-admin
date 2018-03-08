import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as moment from 'moment-timezone';

import { Application } from 'app/models/application';
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentService } from 'app/services/comment.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})

export class ApplicationDetailComponent implements OnInit, OnDestroy {
  public application: Application;
  private daysRemaining = '?';
  private numComments = '?';
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService, // also used in template
    private applicationService: ApplicationService, // used in template
    private commentPeriodService: CommentPeriodService, // used in template
    private commentService: CommentService
  ) { }

  ngOnInit() {
    // if we're not logged in, redirect
    if (!this.api.ensureLoggedIn()) {
      return; // return false;
    }

    // get data directly from resolver
    this.application = this.route.snapshot.data['application'];

    // application not found --> navigate back to application list
    if (!this.application || !this.application._id) {
      alert('Uh-oh, couldn\'t load application');
      this.router.navigate(['/applications']);
    }

    // get comment period days remaining
    if (this.application.currentPeriod) { // TODO: only published comment period!
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const days = moment(this.application.currentPeriod.endDate).diff(moment(today), 'days') + 1;
      this.daysRemaining = days + (days === 1 ? ' Day ' : ' Days ') + 'Remaining';
    }

    // get number of pending comments
    this.commentService.getAllByApplicationId(this.application._id)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        comments => {
          const count = comments.length; // TODO: count only # pending
          this.numComments = count.toString();
        },
        error => { }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public launchMap() {
    const appId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: appId }]);
  }

  public gotoMap() {
    // pass along the id of the current application if available
    // so that the map component can show the popup for it.
    const appId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: appId }]);
  }
}
