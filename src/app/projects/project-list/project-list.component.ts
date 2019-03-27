import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';

import { Project } from 'app/models/project';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ProjectListTableRowsComponent } from './project-list-table-rows/project-list-table-rows.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})

export class ProjectListComponent implements OnInit, OnDestroy {
  public projects: Array<Project> = [];
  public loading = true;

  public showOnlyOpenApps: boolean;

  public projectTableData: TableObject;
  public projectTableColumns: any[] = [
    {
      name: 'Name',
      value: 'name',
      width: 'col-2'
    },
    {
      name: 'Proponent',
      value: 'proponent',
      width: 'col-2'
    },
    {
      name: 'Type',
      value: 'type',
      width: 'col-2'
    },
    {
      name: 'Region',
      value: 'region',
      width: 'col-2'
    },
    {
      name: 'Phase',
      value: 'currentPhaseName',
      width: 'col-2'
    },
    {
      name: 'Decision',
      value: 'eacDecision',
      width: 'col-2'
    }
  ];

  public pageNum = 1;
  public pageSize = 15;
  public currentPage = 1;
  public totalProjects = 0;
  public sortBy = '';
  public sortDirection = 0;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    public commentPeriodService: CommentPeriodService,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentPage = params.currentPage ? params.currentPage : 1;
      this.pageSize = params.pageSize || 15;
      this.projectService.getAll(params.currentPage, params.pageSize)
        .takeUntil(this.ngUnsubscribe)
        .subscribe((res: any) => {
          if (res) {
            this.loading = false;
            this.totalProjects = res.totalCount;
            this.projects = res.data;
            this.setProjectRowData();
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load topics');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
            this.loading = false;
          }
        });
    });
  }

  setProjectRowData() {
    let projectList = [];
    this.projects.forEach(project => {
      projectList.push(
        {
          _id: project._id,
          name: project.name,
          proponent: project.proponent,
          type: project.type,
          region: project.region,
          currentPhaseName: project.currentPhaseName,
          eacDecision: project.eacDecision
        }
      );
    });
    this.projectTableData = new TableObject(
      ProjectListTableRowsComponent,
      projectList,
      {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        totalListItems: this.totalProjects,
        sortBy: this.sortBy,
        sortDirection: this.sortDirection
      }
    );
  }

  setColumnSort(column) {
    this.sortBy = column;
    this.sortDirection = this.sortDirection > 0 ? -1 : 1;
    this.getPaginatedProjects(this.currentPage, this.sortBy, this.sortDirection);
  }

  getPaginatedProjects(pageNumber, sortBy, sortDirection) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);

    if (sortBy == null) {
      sortBy = this.sortBy;
      sortDirection = this.sortDirection;
    }

    // This accounts for when there is no defined column sort and the user clicks a pagination button.
    // API needs sorting to be null for it to not blow up.
    let sorting = null;
    if (sortBy !== '') {
      sorting = (sortDirection > 0 ? '+' : '-') + sortBy;
    }
    this.projectService.getAll(pageNumber, this.pageSize, sorting)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.currentPage = pageNumber;
        this.sortBy = sortBy;
        this.sortDirection = this.sortDirection;
        this.tableTemplateUtils.updateUrl(sorting, this.currentPage, this.pageSize);
        this.totalProjects = res.totalCount;
        this.projects = res.data;
        this.setProjectRowData();
        this._changeDetectionRef.detectChanges();
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
