/*
 * This component is no longer supported (but it may still mostly work).
 * There is no route to this component but it can be navigated to directly.
 * Some developers might find this component useful for looking at data.
 * Known issues:
 * - the accordion collapse is broken because it needs jQuery (which has since been removed)
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})

export class ApplicationListComponent implements OnInit, OnDestroy {
  public loading = true;
  private paramMap: ParamMap = null;
  public showOnlyOpenApps: boolean;
  public applications: Array<Application> = [];
  public column: string = null;
  public direction = 0;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    public commentPeriodService: CommentPeriodService
  ) { }

  ngOnInit() {
    // get optional query parameters
    this.route.queryParamMap
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(paramMap => {
        this.paramMap = paramMap;

        // set initial filters
        this.resetFilters();
      });

    // get data
    this.applicationService.getAll({ getCurrentPeriod: true })
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        applications => {
          this.loading = false;
          this.applications = applications;
        },
        error => {
          this.loading = false;
          console.log(error);
          alert('Uh-oh, couldn\'t load applications');
          // applications not found --> navigate back to home
          this.router.navigate(['/']);
        }
      );
  }

  public showOnlyOpenAppsChange(checked: boolean) {
    this.showOnlyOpenApps = checked;
    this.saveFilters();
  }

  private saveFilters() {
    const params: Params = {};

    if (this.showOnlyOpenApps) {
      params['showOnlyOpenApps'] = true;
    }

    if (this.column && this.direction) {
      params['col'] = this.column;
      params['dir'] = this.direction;
    }

    // change browser URL without reloading page (so any query params are saved in history)
    this.location.go(this.router.createUrlTree([], { relativeTo: this.route, queryParams: params }).toString());
  }

  private resetFilters() {
    this.showOnlyOpenApps = (this.paramMap.get('showOnlyOpenApps') === 'true');
    this.column = this.paramMap.get('col'); // == null if col isn't present
    this.direction = +this.paramMap.get('dir'); // == 0 if dir isn't present
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public sort(property: string) {
    this.column = property;
    this.direction = this.direction > 0 ? -1 : 1;
    this.saveFilters();
  }

  public showThisApp(item: Application) {
    const statusCode = item && this.commentPeriodService.getStatusCode(item.currentPeriod);
    return !this.showOnlyOpenApps
      || this.commentPeriodService.isOpen(statusCode)
      || this.commentPeriodService.isNotStarted(statusCode);
  }
}
