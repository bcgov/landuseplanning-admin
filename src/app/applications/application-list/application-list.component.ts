import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';

import { Application } from '../../models/application';
import { ApplicationService } from '../../services/application.service';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationListComponent implements OnInit {
  applications: Array<Application>;
  public isDesc: boolean;
  public column: string;
  public direction: number;
  public loading: boolean;
  public mineCount: number;
  public config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 25,
    currentPage: 1
  };

  constructor(
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
    this.applicationService.getAll().subscribe(
      data => {
        this.applications = data;
        this.mineCount = data ? data.length : 0;
        this.loading = false;
        // Needed in development mode - not required in prod.
        this._changeDetectionRef.detectChanges();
      },
      error => console.log(error)
    );
  }

  sort(property) {
    this.isDesc = !this.isDesc;
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }
}
