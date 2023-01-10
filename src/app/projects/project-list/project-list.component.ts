import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import { JwtUtil } from 'app/jwt-util';

import { Project } from 'app/models/project';
import { SearchTerms } from 'app/models/search';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

import { ProjectListTableRowsComponent } from './project-list-table-rows/project-list-table-rows.component';

import { SearchService } from 'app/services/search.service';
import { KeycloakService } from 'app/services/keycloak.service'
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})

export class ProjectListComponent implements OnInit, OnDestroy {
  public projects: Array<Project> = [];
  public loading = true;

  public showOnlyOpenApps: boolean;
  public tableParams: TableParamsObject = new TableParamsObject();
  public terms = new SearchTerms();
  public visibility: string = '';
  public canUserCreateProjects: boolean;

  public projectTableData: TableObject;
  public projectTableColumns: any[] = [
    {
      name: 'Name',
      value: 'name',
      width: 'col-3'
    },
    {
      name: 'Partner',
      value: 'partner',
      width: 'col-2'
    },
    {
      name: 'Regional Districts',
      value: 'overlappingRegionalDistricts',
      width: 'col-3'
    },
    {
      name: 'Phase',
      value: 'projectPhase',
      width: 'col-2'
    },
    {
      name: 'Visibility',
      value: 'visibility',
      width: 'col-2'
    }
  ];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tableTemplateUtils: TableTemplateUtils,
    private navigationStackUtils: NavigationStackUtils,
    private searchService: SearchService,
    private keycloakService: KeycloakService,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  /**
   * Get the project table data from the route params. Check if the user can
   * add new projects(to enable or disable the button on this view). Get all
   * project data from the route resolver.
   * 
   * @return {void}
   */
  ngOnInit() {
    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
        if (this.tableParams.sortBy === '') {
          this.tableParams.sortBy = '+name';
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
        }

        const token = this.keycloakService.getToken();
        if (token) {
          const jwt = new JwtUtil().decodeToken(token);
          this.canUserCreateProjects = jwt.client_roles.includes('create-projects');
        }

        this.route.data
          .takeUntil(this.ngUnsubscribe)
          .subscribe((res: any) => {
            if (res.projects[0].data) {
              if (res.projects[0].data.searchResults.length > 0) {
                this.tableParams.totalListItems = res.projects[0].data.meta[0].searchResultsTotal;
                this.projects = res.projects[0].data.searchResults;
              } else {
                this.tableParams.totalListItems = 0;
                this.projects = [];
              }
              this.setRowData();
              this.loading = false;
              this._changeDetectionRef.detectChanges();
            } else {
              alert('Uh-oh, couldn\'t load topics');
              // project not found --> navigate back to search
              this.router.navigate(['/']);
            }
          });
      });
  }

  /**
   * Clear the navigation stack, then navigate the user to the "add project"
   * page.
   * 
   * @return {void}
   */
  addProject() {
    this.navigationStackUtils.clearNavigationStack();
    this.router.navigate(['/projects', 'add']);
  }

  /**
   * Set the data to use in the table UI component. This displays
   * the loaded projects to the user.
   * 
   * @return {void}
   */
  setRowData() {
    let projectList = [];
    if (this.projects && this.projects.length > 0) {
      this.projects.forEach(project => {
        project.read.includes('public') ? this.visibility = "Published" : this.visibility = "Not Published";
        projectList.push(
          {
            _id: project._id,
            name: project.name,
            partner: project.partner,
            overlappingRegionalDistricts: this.stringifyOverlappingDistricts(project.overlappingRegionalDistricts as string | string[]),
            engagementStatus: project.engagementStatus,
            projectPhase: project.projectPhase,
            visibility: this.visibility
          }

        );
      });
      this.projectTableData = new TableObject(
        ProjectListTableRowsComponent,
        projectList,
        this.tableParams
      );
    }
  }

  /**
   * Turn the array of overlapping districts and turn it into a comma-
   * separated string.
   * 
   * @param {string|string[]} districts The array to turn into a string.
   * @returns {string}
   */
  stringifyOverlappingDistricts(districts: string | string[]): string {
    let overlappingDistrictsListString: string;
    if (Array.isArray(districts) === true ) {
      overlappingDistrictsListString = (<string[]>districts).join(', ');
    } else {
      overlappingDistrictsListString = districts as string;
    }
    return overlappingDistrictsListString;
  }

  /**
   * When the user sorts the table by column, update the table params
   * with the sort type and direction(+,-), then get a list of projects
   * sorted accordingly.
   * 
   * @param {string} column What value to sort by.
   * @return {void}
   */
  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedProjects(this.tableParams.currentPage);
  }

  /**
   * Section the projects into "pages" for display in the table.
   * 
   * @param {number} pageNumber The page number to update the table with.
   * @return {void}
   */
  getPaginatedProjects(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.searchService.getSearchResults(
      this.tableParams.keywords || '',
      'Project',
      null,
      pageNumber,
      this.tableParams.pageSize,
      this.tableParams.sortBy,
      {}
    )
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res[0].data) {
          this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
          this.projects = res[0].data.searchResults;
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
          this.setRowData();
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load topics');
          // project not found --> navigate back to search
          this.router.navigate(['/']);
        }
      });
  }

  /**
   * Update the table contents and the URL when the user searches in the 
   * projects table.
   * 
   * @return {void}
   */
  public onSubmit() {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy = '';
    params['keywords'] = this.tableParams.keywords;
    params['pageSize'] = this.tableParams.pageSize = 10;
    this.router.navigate(['projects', params]);
  }

  /**
   * Terminate subscriptions when component is unmounted.
   *
   * @return {void}
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
