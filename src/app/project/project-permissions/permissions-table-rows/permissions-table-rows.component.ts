import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableComponent } from 'app/shared/components/table-template/table.component';
import { StorageService } from 'app/services/storage.service';
import { UserService } from 'app/services/user.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar'
import { User } from 'app/models/user'
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Project } from 'app/models/project';
import { KeycloakService } from 'app/services/keycloak.service';
import { JwtUtil } from 'app/jwt-util';


/**
 * Interface representing the decoded Keycloak JWT token.
 * Fields based on observed token structure from KeycloakService.getToken().
 */
interface DecodedToken {
  idir_user_guid: string;
  display_name?: string;
  aud?: string;
  auth_time?: number;
  azp?: string;
  client_roles?: string[];
  email?: string;
  email_verified?: boolean;
  exp?: number;
  family_name?: string;
  given_name?: string;
  iat?: number;
  identity_provider?: string;
  idir_username?: string;
  iss?: string;
  jti?: string;
  name?: string;
  nonce?: string;
  preferred_username?: string;
  sid?: string;
  sub?: string;
  typ?: string;
}

@Component({
  selector: 'app-permissions-table-rows',
  templateUrl: './permissions-table-rows.component.html',
  styleUrls: ['./permissions-table-rows.component.scss']
})
export class PermissionsTableRowsComponent implements OnInit, TableComponent {

  @Input() data: TableObject;

  public entries: User[];
  public entriesVault: User[];
  public targetEmail: any;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private currentProject: Project;
  private currentUser: DecodedToken;
  public paginationData: any;
  public tableParams: TableParamsObject = new TableParamsObject();

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    private router: Router,
    private ngxSmartModalService: NgxSmartModalService,
    private keycloakService: KeycloakService,
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

    const token = this.keycloakService.getToken();
    this.currentUser = token ? new JwtUtil().decodeToken(token) : null;

    this.ngxSmartModalService.getModal('confirmation-modal').onClose.subscribe(() => {
      const modalData = this.ngxSmartModalService.getModalData('confirmation-modal');
      if (modalData.deleteConfirm && modalData.user?.idirUserGuid === this.currentUser?.idir_user_guid) {
        this.openSnackBar(`Sorry, you are not allowed to delete yourself.`, 'close');
        return;
      }
      if (modalData.deleteConfirm && modalData.user._id) {
        // If the admin selected "OK" and a valid user ID is found, remove user from project
        this.userService.removeUser(modalData.user)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          (returnedUsers) => {
            this.entriesVault = returnedUsers;
            this.entriesVault = this.removeDuplicateUsers(this.entriesVault);
            this.paginateUsers(this.paginationData.currentPage);
          },
          error => {
            console.error(error);
            alert('Uh-oh, couldn\'t remove user.');
            this.router.navigate(['/p', this.currentProject._id ]);
          },
          () => { // onCompleted
            this.openSnackBar(`${modalData.user.displayName || 'User'} has been removed from the permissions list.`, 'close')
          })
      } else if (modalData.deleteConfirm && !modalData.user._id) {
        // If the admin selected "OK" but a valid user ID isn't found, trigger a console error
        console.error('Unable to delete user. The user entry is malformed.');
      }
    });

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
    return this.currentProject?._id && user.projectPermissions?.includes(this.currentProject._id);
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
      if (user.displayName && !userNames.includes(user.displayName)) {
        // If no duplicate name is found, validate the user
        userNames.push(user.displayName);
        validatedUsers.push(user);
      } else if (user.displayName && this.currentProject?._id && user.projectPermissions.includes(this.currentProject._id)) { 
        // If a duplicate user is found and they have project permission, replace matching entry if it doesn't have permissions
        const matchingUserIndex = validatedUsers.findIndex((usr) => usr.displayName === user.displayName);
        validatedUsers[matchingUserIndex] = this.currentProject?._id && validatedUsers[matchingUserIndex]?.projectPermissions?.includes(this.currentProject._id) ? validatedUsers[matchingUserIndex] : user;
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

  /**
   * Handles a request to delete a user from the permissions list.
   *
   * @param {User} user The user that needs to be deleted.
   * @return {void}
   */
  handleDeleteUser(user: User): void {
    if (user._id && user.displayName) {
      this.ngxSmartModalService.setModalData(
        {
          type: 'delete',
          title: 'Delete User',
          message: `Are you sure you want to remove ${user.displayName} from the permissions user list?`,
          user: user,
        }, 
        'confirmation-modal', 
        true
      );

      this.ngxSmartModalService.open('confirmation-modal');
    } else {
      console.error('The user entry is malformed. Unable to remove user.')
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }
}
