import { Component, OnInit } from '@angular/core';
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

    this.userService.getAll()
      .toPromise()
      .then((user: User) => {
        this.users = get(user, 'data');
        this.tableParams.totalListItems = get(user, 'totalCount');
        //return user;
        this.setRowData();
        this.loading = false;
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Set the data to use in the table UI component. This displays
   * the loaded users(with permissions) to the user.
   * 
   * @return {void}
   */
  setRowData() {
    let list = [];
    if (this.users && this.users.length > 0) {
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

}
