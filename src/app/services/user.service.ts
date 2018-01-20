import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { User } from '../models/user';

@Injectable()
export class UserService {
  user: User;

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
}
