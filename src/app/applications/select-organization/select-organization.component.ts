import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationService } from 'app/services/organization.service';
import { Organization } from 'app/models/organization';
import * as _ from 'lodash';

export interface DataModel {
  selectedOrgId: string;
}

@Component({
  selector: 'app-select-organization',
  templateUrl: './select-organization.component.html',
  styleUrls: ['./select-organization.component.scss']
})
export class SelectOrganizationComponent extends DialogComponent<DataModel, string> implements DataModel, OnInit {
  public selectedOrgId: string;
  public organizations: Organization[] = [];
  public page = 1;
  public selectedOrg: Organization = null;

  constructor(
    public dialogService: DialogService,
    private router: Router,
    private orgService: OrganizationService
  ) {
    super(dialogService);
  }

  selectOrganization(org) {
    this.selectedOrg = org;
  }

  ngOnInit() {
    const self = this;
    this.orgService.getAll()
      .subscribe(
        data => {
          _.each(data, function (i) {
            self.organizations.push(new Organization(i));
            // Pre-select the existing org if it's in the list
            if (i._id === self.selectedOrgId) {
              self.selectedOrg = i;
            }
          });
        },
        error => {
          // If 403, redir to /login.
          if (error.startsWith('403')) {
            this.router.navigate(['/login']);
          }
          alert('Error loading users');
        });
  }

  save() {
    this.result = this.selectedOrg._id;
    // alert('Save is not yet implemented');
    this.close();
  }
}
