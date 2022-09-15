import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { User } from 'app/models/user';
import { Project } from 'app/models/project';

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

  getAll(): Observable<Object> {
    let userList = [];
    return this.api.getAllUsers()
      .map((res: any) => {
        if (res) {
          if (!res || res.length === 0) {
            return { totalCount: 0, data: [] };
          }
          res.forEach(user => {
            /*
            * Checks that users returned are valid and not leftover "Contact"
            * documents that don't represent real backend users
            */
            if (user.idirUserGuid) {
              userList.push(user);
            }
          });
          return { totalCount: res.length, data: userList };
        }
        return {};
      })
      .catch(error => this.api.handleError(error));
  }

  addProjectPermission(user: User, proj: Project): Observable<User> {
    return this.api.addProjectToUser(user, proj)
      .catch(error => this.api.handleError(error));
  }

  removeProjectPermission(user: User, proj: Project): Observable<User> {
    return this.api.removeProjectFromUser(user, proj)
      .catch(error => this.api.handleError(error));
  }
}
