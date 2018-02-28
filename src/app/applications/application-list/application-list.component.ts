import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PaginationInstance } from 'ngx-pagination';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';
import { OrganizationService } from 'app/services/organization.service';
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

  private sub: Subscription;

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private router: Router,
    private api: ApiService,
    private applicationService: ApplicationService,
    private orgService: OrganizationService,
    private commentPeriodService: CommentPeriodService
  ) { }

  ngOnInit() {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    const self = this;
    this.sub = this.applicationService.getAll()
      .subscribe(
        applications => {
          this.applications = applications;
          // TODO: should not have to get proponent here because getAll() above is also getting it
          //       but this works around a change detection issue
          _.each(this.applications, function (application) {
            if (application._proponent) {
              self.orgService.getById(application._proponent)
                .subscribe(
                  proponent => {
                    self.loading = false;
                    const f = _.find(self.applications, function (app) {
                      return (app._proponent === proponent._id);
                    });
                    if (f) {
                      f.proponent = proponent;
                      self._changeDetectionRef.detectChanges();
                    }
                  },
                  error => {
                    self.loading = false;
                    console.log('error:', error);
                  }
                );
            }
          });
          // Needed in development mode - not required in prod?
          this._changeDetectionRef.detectChanges();
        },
        error => {
          this.loading = false;
          // If 403, redir to /login.
          if (error.startsWith('403')) { this.router.navigate(['/login']); }
          alert('Error loading applications');
        });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  createApplication() {
    this.applicationService.addApplication(new Application())
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
