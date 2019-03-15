import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { User } from 'app/models/user';

@Injectable()
export class UserService {
  constructor(private api: ApiService) {}

  getAll(): Observable<User[]> {
    return this.api.getUsers().pipe(
      map(res => {
        if (res && res.length > 0) {
          const users: User[] = [];
          res.forEach(user => {
            users.push(new User(user));
          });
          return users;
        }
        return [];
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  save(user: User): Observable<User> {
    return this.api.saveUser(user).pipe(catchError(error => this.api.handleError(error)));
  }

  add(user: User): Observable<User> {
    return this.api.addUser(user).pipe(catchError(error => this.api.handleError(error)));
  }
}
