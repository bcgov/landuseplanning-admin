import { Component, OnInit, Input } from '@angular/core';
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
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';


@Component({
  selector: 'app-permissions-table-rows',
  templateUrl: './permissions-table-rows.component.html',
  styleUrls: ['./permissions-table-rows.component.css']
})
export class PermissionsTableRowsComponent implements OnInit, TableComponent {

  @Input() data: TableObject;

  public entries: User[];
  public entriesVault;
  public targetEmail: any;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private currentProject;
  public paginationData: any;
  public tableParams: TableParamsObject = new TableParamsObject();

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) { }

  /**
   * Get the current project from local storage, then get all users with
   * their permissions from the route resolver.
   *
   * @return {void}
   */
  ngOnInit(): void {
    this.currentProject = this.storageService.state.currentProject.data;
    this.entries = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  /**
   * Opens a new snack bar notification message with a duration of 2 seconds, and executes an action.
   *
   * @param {string} message A snack bar notification message.
   * @param {string} action A snack bar notification action.
   * @return {void}
   */
   public openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  /**
   * Determines if a user has project permission.
   *
   * @param {User} user The user to check.
   * @returns {boolean}
   */
  hasProjectPermission(user: User): boolean {
    return user.projectPermissions.includes(this.currentProject._id);
  }

  /**
   * Removes duplicate user entries.
   *
   * @param {User[]} returnedUsers The user list that will be checked for duplicate users.
   * @returns {User[]}
   */
  removeDuplicateUsers(returnedUsers: User[]): User[] {
    const userNames = [];
    let validatedUsers = [];
    if (Array.isArray(this.entries)) {
    returnedUsers.forEach(user => {
      if (!userNames.includes(user.displayName)) {
        // If no duplicate name is found, validate the user
        userNames.push(user.displayName);
        validatedUsers.push(user);
      } else if (user.projectPermissions.includes(this.currentProject._id)) { 
        // If a duplicate user is found and they have project permission, replace matching entry if it doesn't have permissions
        const matchingUserIndex = validatedUsers.findIndex((usr) => usr.displayName === user.displayName);
        validatedUsers[matchingUserIndex] = validatedUsers[matchingUserIndex]?.projectPermissions?.includes(this.currentProject._id) ? validatedUsers[matchingUserIndex] : user;
      }
    })
    }
    return validatedUsers;
  }

  /**
   * Load a "page" of users.
   *
   * @param {number} pageNumber The page number of users to get.
   * @return {void}
   */
  paginateUsers(pageNumber: number): void {
    window.scrollTo(0, 0);
    const startIndex = (pageNumber - 1) * this.paginationData.pageSize;
    const endIndex = startIndex + this.paginationData.pageSize;
    if (endIndex && 0 < this.entriesVault.length) {
      this.entries = this.entriesVault.slice(startIndex, endIndex);
    }
  }

  /**
   * Handles a permission checkbox change by adding or removing user permissions and reloading results.
   *
   * @param {MatCheckboxChange} event The event that was captured when the checkbox was changed.
   * @param {User} user The user that needs their permissions added or removed.
   * @return {void}
   */
  handlePermissionCheckboxChange(event: MatCheckboxChange, user: User): void {
    if (this.hasProjectPermission(user)) {
      this.userService.removeProjectPermission(user, this.currentProject)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (returnedUsers) => {
          this.entriesVault = returnedUsers;
          this.entriesVault = this.removeDuplicateUsers(this.entriesVault);
          this.paginateUsers(this.paginationData.currentPage);
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
          this.entriesVault = returnedUsers;
          this.entriesVault = this.removeDuplicateUsers(this.entriesVault);
          this.paginateUsers(this.paginationData.currentPage);
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
