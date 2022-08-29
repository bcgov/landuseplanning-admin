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
        console.log('Error getting users data', error);
      });
  }

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
      console.log('List', list);
      this.tableData = new TableObject(
        PermissionsTableRowsComponent,
        list,
        this.tableParams
      );
    }
  }

}
