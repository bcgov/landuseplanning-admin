import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginationInstance } from 'ngx-pagination';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as moment from 'moment';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApiService } from 'app/services/api';
import { CommentPeriodService } from 'app/services/commentperiod.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})

export class ApplicationListComponent implements OnInit, OnDestroy {
  public showOnlyOpenApps = false;
  public applications: Array<Application> = [];
  public isDesc: boolean;
  public column: string;
  public direction: number;
  public loading = true;
  public config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 25,
    currentPage: 1
  };
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    public commentPeriodService: CommentPeriodService
  ) { }

  ngOnInit() {
    // if we're not logged in, redirect
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    // get optional route parameter (matrix URL notation)
    if (this.route.snapshot.paramMap.get('showOnlyOpenApps') === 'true') {
      this.showOnlyOpenApps = true;
    }

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { applications: Application[] }) => {
          if (data.applications) {
            this.applications = data.applications;
          } else {
            // applications not found --> navigate back to home
            alert('Uh-oh, couldn\'t load applications');
            this.router.navigate(['/']);
          }
        }
      );
  }

  public getDaysRemaining(item: Application): string {
    if (item._id !== '0' && item.currentPeriod) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      // use moment to handle Daylight Saving Time changes
      const days = moment(item.currentPeriod.endDate).diff(moment(today), 'days') + 1;
      return (days + (days === 1 ? ' Day ' : ' Days ') + 'Remaining');
    }
}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public sort(property: string) {
    this.isDesc = !this.isDesc;
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

  public showThisApp(item: Application) {
    return !this.showOnlyOpenApps
      || this.commentPeriodService.isOpen(item.currentPeriod)
      || this.commentPeriodService.isNotStarted(item.currentPeriod);
  }
}
