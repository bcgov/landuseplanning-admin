import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PaginationInstance } from 'ngx-pagination';
import { Subscription } from 'rxjs/Subscription';

import { Application } from '../../models/application';
import { ApplicationService } from '../../services/application.service';
import { ApiService } from '../../services/api';

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
  public loading: boolean;
  public appCount: number;
  public config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 25,
    currentPage: 1
  };

  private sub: Subscription;

  constructor(
    private router: Router,
    private applicationService: ApplicationService,
    private _changeDetectionRef: ChangeDetectorRef,
    private api: ApiService
  ) { }

  ngOnInit() {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    this.loading = true;

    this.sub = this.applicationService.getAll()
      // .finally(() => this.loading = false) // TODO: make this work
      .subscribe(
      applications => {
        this.loading = false;
        this.applications = applications;
        this.appCount = applications ? applications.length : 0;
        // Needed in development mode - not required in prod.
        this._changeDetectionRef.detectChanges();
      },
      error => {
        this.loading = false;
        // If 403, redir to /login.
        if (error.startsWith('403')) {
          this.router.navigate(['/login']);
        }
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
