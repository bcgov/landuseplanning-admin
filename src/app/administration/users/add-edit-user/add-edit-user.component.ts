import { Component } from '@angular/core';
import { User } from '../../../models/user';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { ApiService } from '../../../services/api';

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
              private api: ApiService) {
    super(dialogService);
  }

  ngOnInit(): void {
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
      this.networkMsg = "";
      if (this.isNew) {
        this.api.addUser(this.user).subscribe(
        data => {
          console.log('data', data);
          this.result = true;
          this.isNew = false;
          this.close();
        },
        error => {
          console.log('error', error.json().message);
          this.networkMsg = error.json().message;
        });
      } else {
        this.api.saveUser(this.user).subscribe(
        data => {
          console.log('data', data);
          this.result = true;
          this.isNew = false;
          this.close();
        },
        error => {
          console.log('error', error.json().message);
          this.networkMsg = error.json().message;
        });
      }
  }
}
