import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { PaginationInstance } from 'ngx-pagination';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as moment from 'moment';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
  animations: [
    trigger('visibility', [
      transition(':enter', [   // :enter is alias to 'void => *'
        animate('0.2s 0s', style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('0.2s 0.75s', style({ opacity: 0 }))
      ])
    ])
  ]
})

export class ApplicationListComponent implements OnInit, OnDestroy {
  public loading = true;
  public showOnlyOpenApps: boolean;
  public applications: Array<Application> = [];
  public isDesc: boolean;
  public column: string;
  public direction: number;
  public config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 25,
    currentPage: 1
  };
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private location: Location,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    public commentPeriodService: CommentPeriodService
  ) { }

  ngOnInit() {
    // if we're not logged in, redirect
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    // get optional query parameter
    this.route.queryParamMap
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.showOnlyOpenApps = (params.get('showOnlyOpenApps') === 'true');
      });

    // get data
    this.applicationService.getAll()
      .takeUntil(this.ngUnsubscribe)
      .subscribe(applications => {
        this.applications = applications;
        this.loading = false;
      }, error => {
        console.log(error);
        alert('Uh-oh, couldn\'t load applications');
        this.loading = false;
        // applications not found --> navigate back to home
        this.router.navigate(['/']);
      });
  }

  public showOnlyOpenAppsChange(checked: boolean) {
    this.showOnlyOpenApps = checked;

    // change browser URL without reloading page (so query param is saved in history)
    if (checked) {
      this.location.go(this.router.createUrlTree([], { relativeTo: this.route, queryParams: { showOnlyOpenApps: true } }).toString());
    } else {
      this.location.go(this.router.createUrlTree([], { relativeTo: this.route }).toString());
    }
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
