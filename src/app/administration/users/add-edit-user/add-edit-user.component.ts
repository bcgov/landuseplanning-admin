import { Component } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';

import { User } from 'app/models/user';
import { UserService } from 'app/services/user.service';

export interface DataModel {
  title: string;
  message: string;
  model: User;
}

@Component({
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.scss']
})

export class AddEditUserComponent extends DialogComponent<DataModel, boolean> implements DataModel {
  title: string;
  message: string;
  model: User;
  user: User;
  isNew: boolean;
  powers: string[];
  networkMsg: string;

  constructor(dialogService: DialogService,
    private userService: UserService) {
    super(dialogService);
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    // console.log("this.model:", this.user);
    // TODO: Current is simple method of assigning roles
    this.powers = ['public', 'sysadmin'];
    if (this.model === null) {
      this.isNew = true;
    } else {
      this.isNew = false;
    }
    this.user = new User(this.model);
  }

  onSubmit() {
    // Don't do anything yet
  }

  save() {
    // console.log('submitted form', this.user);
    this.networkMsg = '';
    if (this.isNew) {
      this.userService.add(this.user)
        .subscribe(
          data => {
            this.result = true;
            this.isNew = false;
            this.close();
          },
          error => {
            this.networkMsg = error;
          });
    } else {
      this.userService.save(this.user)
        .subscribe(
          data => {
            this.result = true;
            this.isNew = false;
            this.close();
          },
          error => {
            this.networkMsg = error;
          });
    }
  }
}
