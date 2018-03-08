import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { User } from '../../models/user';
import * as _ from 'lodash';
import { DialogService } from 'ng2-bootstrap-modal';
import { AddEditUserComponent } from './add-edit-user/add-edit-user.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UsersComponent implements OnInit, OnDestroy {
  public users: Array<User>;
  public loading = true;
  public sysadmins: Array<User> = [];
  public standards: Array<User> = [];
  private sub: Subscription;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private userService: UserService,
    private router: Router,
    private dialogService: DialogService,
    private _changeDetectionRef: ChangeDetectorRef,
    private api: ApiService) { }

  ngOnInit() {
    this.refreshUsersUI();
  }

  refreshUsersUI() {
    // if we're not logged in, redirect
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    this.sub = this.userService.getAll()
      .subscribe(
      data => {
        this.loading = false;
        this.users = data;
        const self = this;
        console.log('roles:', data);
        _.each(data, function (i) {
          if (_.some(i.roles, _.method('includes', 'sysadmin'))) {
            self.sysadmins.push(i);
          } else {
            self.standards.push(i);
          }
        });
        // Needed in development mode - not required in prod.
        this._changeDetectionRef.detectChanges();
      },
      error => {
        this.loading = false;
        // If 403, redir to /login.
        if (error.startsWith('403')) {
          this.router.navigate(['/login']);
        }
        alert('Error loading users');
      });
  }

  addUser() {
    this.dialogService.addDialog(AddEditUserComponent,
    {
      title: 'Create User',
      message: 'Add',
      model: null
    }, {
      // index: 0,
      // autoCloseTimeout: 10000,
      // closeByClickingOutside: true,
      backdropColor: 'rgba(0, 0, 0, 0.5)'
    })
    .takeUntil(this.destroy$)
    .subscribe((isConfirmed) => {
      // we get dialog result
      if (isConfirmed) {
        // console.log('saved');
        this.refreshUsersUI();
      } else {
        // console.log('canceled');
      }
    });
  }

  selectUser(user) {
    this.dialogService.addDialog(AddEditUserComponent,
    {
      title: 'Edit User',
      message: 'Save',
      model: user
    }, {
      // index: 0,
      // autoCloseTimeout: 10000,
      // closeByClickingOutside: true,
      backdropColor: 'rgba(0, 0, 0, 0.5)'
    })
    .takeUntil(this.destroy$)
    .subscribe((isConfirmed) => {
      // we get dialog result
      if (isConfirmed) {
        // console.log('saved');
        this.refreshUsersUI();
      } else {
        // console.log('canceled');
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.sub.unsubscribe();
  }
}
