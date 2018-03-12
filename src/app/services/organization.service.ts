import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';

import { ApiService } from './api';
import { Organization } from 'app/models/organization';

@Injectable()
export class OrganizationService {
  private organization: Organization = null;

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
  getById(orgId: string, forceReload: boolean = false): Observable<Organization> {
    if (this.organization && this.organization._id === orgId && !forceReload) {
      return Observable.of(this.organization);
    }

    return this.api.getOrganization(orgId)
      .map((res: Response) => {
        const organizations = res.text() ? res.json() : [];
        // return the first (only) organization
        return organizations.length > 0 ? new Organization(organizations[0]) : null;
      })
      .map((organization: Organization) => {
        if (!organization) { return null as Organization; }

        this.organization = organization;
        return this.organization;
      })
      .catch(this.api.handleError);
  }
}
