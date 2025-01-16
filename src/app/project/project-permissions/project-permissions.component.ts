import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { get } from 'lodash';
import { Project } from 'app/models/project'
import { UserService } from 'app/services/user.service';
import { User } from 'app/models/user';
import { StorageService } from 'app/services/storage.service';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { PermissionsTableRowsComponent } from './permissions-table-rows/permissions-table-rows.component';
import { PageBreadcrumb } from 'app/shared/components/navbar/types';

@Component({
  selector: 'app-project-permissions',
  templateUrl: './project-permissions.component.html',
  styleUrls: ['./project-permissions.component.css']
})
export class ProjectPermissionsComponent implements OnInit {

  public users: User[] = null;
  public userVault: User[] = null;
  public currentProject: Project;
  public loading = true;
  public pageBreadcrumbs: PageBreadcrumb[];
  public tableData: TableObject;
  public tableParams: TableParamsObject = new TableParamsObject();
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public tableColumns: any[] = [
    {
      name: 'User',
      value: 'user',
      width: 'col-8',
      nosort: true
    },
    {
      name: 'Access',
      value: 'access',
      width: 'col-4',
      nosort: true
    }
  ];

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private userService: UserService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  /**
   * Get the current project from local storage. Update the page breadcrumbs.
   * Get the table config from the route params(to display a default selection
   * of users in the permissions table). Then get the users from the user API.
   * 
   * @return {void}
   */
  ngOnInit(): void {
    this.currentProject = this.storageService.state.currentProject.data;
    this.pageBreadcrumbs = [{
      pageTitle: this.currentProject.name,
      routerLink: [ '/p', this.currentProject._id]
    }];

    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
      });
      this.getUsers();
  }

  /**
   * Retrieve the user list, with permissions info, from the user service
   * 
   * @return {void}
   */
  getUsers(): void {
    this.userService.getAll()
      .toPromise()
      .then((user: User) => {
        this.userVault = get(user, 'data');
        this.removeDuplicateUsers();
        this.tableParams.totalListItems = this.userVault.length || 0;
        this.paginateUsers(this.tableParams.currentPage);
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Remove users that have duplicate names, favouring entries that have permissions.
   * 
   * @return {void}
   */
  removeDuplicateUsers(): void {
    let userNames = [];
    let validatedUsers = [];
    if (Array.isArray(this.userVault)) {
    this.userVault.forEach(user => {
      if (!userNames.includes(user.displayName)) {
        // If no duplicate name is found, validate the user
        userNames.push(user.displayName);
        validatedUsers.push(user);
      } else if (user.projectPermissions?.includes(this.currentProject._id)) { 
        // If a duplicate user is found and they have project permission, replace matching entry if it doesn't have permissions
        const matchingUserIndex = validatedUsers.findIndex((usr) => usr.displayName === user.displayName);
        validatedUsers[matchingUserIndex] = validatedUsers[matchingUserIndex].projectPermissions.includes(this.currentProject._id) ? validatedUsers[matchingUserIndex] : user;
      }
    })
    }
    this.userVault = validatedUsers;
  }

  /**
   * Set the data to use in the table UI component. This displays
   * the loaded users(with permissions) to the user.
   * 
   * @return {void}
   */
  setRowData(): void {
    let list = [];
    if (this.users?.length > 0) {
      this.users.forEach(user => {
        list.push(
          {
            _id: user._id,
            displayName: user.displayName,
            projectPermissions: user.projectPermissions
          }
        );
      });
      this.tableData = new TableObject(
        PermissionsTableRowsComponent,
        list,
        this.tableParams
      );
    }
  }

  /**
   * Load a "page" of documents.
   *
   * @param {number} pageNumber The page number of documents to get.
   * @return {void}
   */
  public paginateUsers(pageNumber: number): void {
    window.scrollTo(0, 0);
    this.loading = true;
    this.tableParams.currentPage = pageNumber;
    const startIndex = (pageNumber - 1) * this.tableParams.pageSize;
    const endIndex = startIndex + this.tableParams.pageSize;
    if (endIndex && 0 < this.userVault.length) {
      this.users = this.userVault.slice(startIndex, endIndex);
      this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.filter, this.tableParams.keywords || '');
      this.setRowData();
      this.loading = false;
      this._changeDetectionRef.detectChanges();
    }
  }

  /**
   * Handle a page change
   * 
   */
  public handlePageChange(event: number): void {
    this.tableParams.currentPage = event;
    this.getUsers();
  }
}
