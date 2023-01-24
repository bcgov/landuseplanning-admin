import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { User } from 'app/models/user';
import { Project } from 'app/models/project';

@Injectable()
export class UserService {
  constructor(private api: ApiService) {}

  /**
   * Save a user.
   *
   * @param {User} user The user to save.
   * @returns {Observable}
   */
  save(user: User): Observable<User> {
    return this.api.saveUser(user).pipe(catchError(error => this.api.handleError(error)));
  }

  /**
   * Add a new user.
   *
   * @param {User} user The new user to add.
   * @returns {Observable}
   */
  add(user: User): Observable<User> {
    return this.api.addUser(user).pipe(catchError(error => this.api.handleError(error)));
  }

  /**
   * Get a user by its ID.
   *
   * @param {string} userID The user ID to search by.
   * @returns {Observable}
   */
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

  /**
   * Get all users. Account for the related "Contact" schemas and only return
   * Users.
   *
   * @returns {Observable}
   */
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

  /**
   * Give a user permission to access a certain project.
   *
   * @param {User} user The user to give permission to.
   * @param {Project} proj The project to give the user permission to access.
   * @returns {Observable}
   */
  addProjectPermission(user: User, proj: Project): Observable<User> {
    return this.api.addProjectToUser(user, proj)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Remove access to a project from a user.
   *
   * @param {User} user The user to remove the permission from.
   * @param {Project} proj The project to remove access for.
   * @returns {Observable}
   */
  removeProjectPermission(user: User, proj: Project): Observable<User> {
    return this.api.removeProjectFromUser(user, proj)
      .catch(error => this.api.handleError(error));
  }
}
