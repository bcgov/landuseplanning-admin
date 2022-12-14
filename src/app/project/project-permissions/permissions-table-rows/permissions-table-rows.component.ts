import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { get } from 'lodash';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableComponent } from 'app/shared/components/table-template/table.component';
import { StorageService } from 'app/services/storage.service';
import { UserService } from 'app/services/user.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar'
import { User } from 'app/models/user'


@Component({
  selector: 'app-permissions-table-rows',
  templateUrl: './permissions-table-rows.component.html',
  styleUrls: ['./permissions-table-rows.component.css']
})
export class PermissionsTableRowsComponent implements OnInit, TableComponent {

  @Input() data: TableObject;

  public entries: any;
  public targetEmail: any;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private currentProject;

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private userService: UserService,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
    this.entries = this.data.data;
  }

  /**
   * Opens a new snack bar notification message with a duration of 2 seconds, and executes an action
   *
   * @param {string} message A snack bar notification message.
   * @param {string} action A snack bar notification action.
   * @returns {void}
   */
   public openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  hasProjectPermission(user) {
    return user.projectPermissions.includes(this.currentProject._id);
  }


  handlePermissionCheckboxChange(event: MatCheckboxChange, user: User): void {
    if (this.hasProjectPermission(user)) {
      this.userService.removeProjectPermission(user, this.currentProject)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (returnedUsers) => {
          this.entries = returnedUsers;
        },
        error => {
          console.error(error);
          alert('Uh-oh, couldn\'t remove user from project.');
          this.router.navigate(['/p', this.currentProject._id ]);
        },
        () => { // onCompleted
          this.openSnackBar(`User removed from ${this.currentProject.name}`, 'close')
        })
    } else {
      this.userService.addProjectPermission(user, this.currentProject)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (returnedUsers) => {
          this.entries = returnedUsers;

        },
        error => {
          console.error(error);
          alert('Uh-oh, couldn\'t add user to project.');
          this.router.navigate(['/p', this.currentProject._id ]);
        },
        () => { // onCompleted
          this.openSnackBar(`User added to ${this.currentProject.name}`, 'close')

        })
    }
  }

}
