import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { User } from 'app/models/user';

@Injectable()
export class UserService {

  constructor(private api: ApiService) { }

  getAll() {
    return this.api.getAllUsers()
      .map((res: Response) => {
        const users = res.text() ? res.json() : [];

        users.forEach((user, index) => {
          users[index] = new User(user);
        });

        return users;
      })
      .catch(this.api.handleError);
  }

  saveUser(user: User) {
    return this.api.saveUser(user)
      .map((res: Response) => {
        const users = res.text() ? res.json() : [];
        return users;
      })
      .catch(this.api.handleError);
  }

  addUser(user: User) {
    return this.api.addUser(user)
      .map((res: Response) => {
        const users = res.text() ? res.json() : [];
        return users;
      })
      .catch(this.api.handleError);
  }
}
