import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { ApiService } from '../../services/api';
import { Application } from '../../models/application';
import { ApplicationService } from '../../services/application.service';
import { CommentPeriodService } from '../../services/commentperiod.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})

export class ApplicationDetailComponent implements OnInit, OnDestroy {
  public loading = true;
  public application: Application;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    public applicationService: ApplicationService,
    private commentPeriodService: CommentPeriodService
  ) { }

  ngOnInit(): void {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) {
      return; // return false;
    }

    // wait for the resolver to retrieve the application details from back-end
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { application: Application }) => {
          this.loading = false;
          this.application = data.application;

          // application not found --> navigate back to application list
          if (!this.application || !this.application._id) {
            console.log('Application not found!');
            this.router.navigate(['/applications']);
          }
        },
        error => {
          this.loading = false;
          // If 403, redir to /login.
          if (error.startsWith('403')) {
            this.router.navigate(['/login']);
          }
          alert('Error loading application');
        });
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
}
