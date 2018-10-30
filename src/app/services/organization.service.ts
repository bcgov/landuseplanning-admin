import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/catch';
import { of } from 'rxjs';

import { ApiService } from './api';
import { Organization } from 'app/models/organization';

@Injectable()
export class OrganizationService {

  constructor(private api: ApiService) { }

  // get all organizations
  getAll(): Observable<Organization[]> {
    return of([] as Organization[]);

    // return this.api.getOrganizations()
    //   .map(res => {
    //     if (res && res.length > 0) {
    //       const organizations: Array<Organization> = [];
    //       res.forEach(org => {
    //         organizations.push(new Organization(org));
    //       });
    //       return organizations;
    //     }
    //     return [];
    //   })
    //   .catch(error => this.api.handleError(error));
  }

  // get a specific organization by its id
  getById(orgId: string): Observable<Organization> {
    return of(null as Organization);

    // return this.api.getOrganization(orgId)
    //   .map(res => {
    //     if (res && res.length > 0) {
    //       // return the first (only) organization
    //       return new Organization(res[0]);
    //     }
    //     return null;
    //   })
    //   .catch(error => this.api.handleError(error));
  }

}
