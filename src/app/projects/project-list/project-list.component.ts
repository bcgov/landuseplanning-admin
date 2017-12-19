import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';

import { Project } from '../../models/project';
import { ProjectService } from '../../services/project.service';
import { ApplicationService } from '../../services/application.service';
import { Api } from '../../services/api';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListComponent implements OnInit {
  projects: Array<Project>;
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

  constructor(private applicationService: ApplicationService,
              private _changeDetectionRef: ChangeDetectorRef,
              private api: Api) { }

  ngOnInit() {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) return false;
    this.loading = true;
    this.applicationService.getAll().subscribe(
      data => {
        this.projects = data;
        this.mineCount = data ? data.length : 0;
        this.loading = false;
        // Needed in development mode - not required in prod.
        this._changeDetectionRef.detectChanges();
      },
      error => console.log(error)
    );
  }

  sort (property) {
    this.isDesc = !this.isDesc;
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

}
