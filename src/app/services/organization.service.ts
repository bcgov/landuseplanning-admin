import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { Organization } from 'app/models/organization';

@Injectable()
export class OrganizationService {
  organization: Organization;

  constructor(private api: ApiService) { }

  // get all organizations
  getAll() {
    return null;
    // return this.api.getOrganizations()
    //   .map((res: Response) => {
    //     const organizations = res.text() ? res.json() : [];

    //     organizations.forEach((org, index) => {
    //       organizations[index] = new Organization(org);
    //     });

    //     return organizations;
    //   })
    //   .catch(this.api.handleError);
  }

  // get a specific organization by its id
  getById(id: string): Observable<Organization> {
    // return null;
    return this.api.getOrganization(id)
      .map((res: Response) => {
        const organizations = res.text() ? res.json() : [];
        // return just the first (only) organization
        return organizations.length > 0 ? organizations[0] : null;
      })
      .map((organization: Organization) => {
        if (!organization) { return; }

        this.organization = organization;

        return this.organization;
      })
      .catch(this.api.handleError);
  }
}
