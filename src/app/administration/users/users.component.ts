import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api';
import { Subscription } from 'rxjs/Subscription';
import { User } from '../../models/user';
import * as _ from 'lodash';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UsersComponent implements OnInit, OnDestroy {
  public users: Array<User>;
  public loading: boolean;
  public sysadmins: Array<User>;
  public standards: Array<User>;
  private sub: Subscription;

  constructor(private userService: UserService,
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef,

    private api: ApiService) { }

  ngOnInit() {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    this.loading = true;
    this.sysadmins = [];
    this.standards = [];

    this.sub = this.userService.getAll()
      // .finally(() => this.loading = false) // TODO: make this work
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
        // console.log(error); // already displayed by handleError()
      });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
