import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { User } from 'app/models/user';

@Injectable()
export class UserService {
  constructor(private api: ApiService) {}

  save(user: User): Observable<User> {
    return this.api.saveUser(user).pipe(catchError(error => this.api.handleError(error)));
  }

  add(user: User): Observable<User> {
    return this.api.addUser(user).pipe(catchError(error => this.api.handleError(error)));
  }

  getByUserID(userID: string): Observable<User> {
    return this.api.getUser(userID).pipe(
      map(res => {
        if (res && res.length > 0) {
          // return the first (only) user
          return new User(res[0]);
        }
        return null;
      }),
      catchError(error => this.api.handleError(error))
    );
  }
}
