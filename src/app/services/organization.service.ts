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
  getAll(): Observable<Organization[]> {
    return this.api.getOrganizations()
      .map((res: Response) => {
        const organizations = res.text() ? res.json() : [];
        organizations.forEach((org, index) => {
          organizations[index] = new Organization(org);
        });
        return organizations;
      })
      .catch(this.api.handleError);
  }

  // get a specific organization by its id
  getById(id: string): Observable<Organization> {
    return this.api.getOrganization(id)
      .map((res: Response) => {
        const organizations = res.text() ? res.json() : [];
        // return the first (only) organization
        return organizations.length > 0 ? new Organization(organizations[0]) : null;
      })
      .catch(this.api.handleError);
  }
}
