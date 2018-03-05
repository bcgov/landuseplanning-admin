import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginationInstance } from 'ngx-pagination';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ApplicationListComponent implements OnInit, OnDestroy {
  public applications: Array<Application>;
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
    private applicationService: ApplicationService,
    private commentPeriodService: CommentPeriodService,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    // approach 1: get data directly from resolver
    this.applications = this.route.snapshot.data.applications;

    // approach 2: wait for resolver to retrieve applications
    // this.route.data
    //   .takeUntil(this.ngUnsubscribe)
    //   .subscribe(
    //     (data: { applications: Application[] }) => this.applications = data.applications,
    //     error => console.log(error)
    //   );
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  createApplication() {
    this.applicationService.addApplication(new Application())
      .takeUntil(this.ngUnsubscribe)
      .subscribe(application => {
        this.router.navigate(['a/', application._id]);
      });
  }

  public sort(property) {
    this.isDesc = !this.isDesc;
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }
}
