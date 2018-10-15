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

  getAll(): Observable<User[]> {
    return this.api.getAllUsers()
      .catch(this.api.handleError);
  }

  save(user: User): Observable<User> {
    return this.api.saveUser(user)
      .catch(this.api.handleError);
  }

  add(user: User): Observable<User> {
    return this.api.addUser(user)
      .catch(this.api.handleError);
  }
}
