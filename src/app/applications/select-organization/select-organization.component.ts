import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationService } from 'app/services/organization.service';
import { SearchService } from 'app/services/search.service';
import { Organization } from 'app/models/organization';
import { Client } from 'app/models/client';
import * as _ from 'lodash';

export interface DataModel {
  dispositionId: number;
  interestedPartyId: number;
}

@Component({
  selector: 'app-select-organization',
  templateUrl: './select-organization.component.html',
  styleUrls: ['./select-organization.component.scss']
})
export class SelectOrganizationComponent extends DialogComponent<DataModel, string> implements DataModel, OnInit {
  public dispositionId: number;
  public interestedPartyId: number;
  public clients: Client[] = [];
  public selectedClients: string[];
  public page = 1;
  public selectedOrg: Organization = null;

  constructor(
    public dialogService: DialogService,
    private router: Router,
    private orgService: OrganizationService,
    private searchService: SearchService
  ) {
    super(dialogService);
    this.selectedClients = [];
  }

  toggleClient(client) {
    if (this.isClientSelected(client)) {
      _.remove(this.selectedClients, client);
    } else {
      this.selectedClients.push(client);
    }
  }

  isClientSelected(client) {
    const foundClient = _.find(this.selectedClients, function (c) {
      return (c === client);
    });
    if (foundClient) {
      return true;
    } else {
      return false;
    }
  }

  ngOnInit() {
    const self = this;
    this.searchService.getClientsByDispositionId(this.dispositionId)
      .subscribe(
        data => {
          _.each(data, function (i) {
            self.clients.push(new Client(i));
            // Pre-select the existing org if it's in the list
            // if (i._id === self.dispositionId) {
            //   self.selectedOrg = i;
            // }
          });
        },
        error => {
          // if 403, redir to login page
          if (error.startsWith('403')) { this.router.navigate(['/login']); }
          alert('Error loading users');
        });
  }

  save() {
    let res = '';
    _.each(this.selectedClients, function (client) {
      const c = new Client(client);
      if (c.ORGANIZATIONS_LEGAL_NAME) {
        res += c.ORGANIZATIONS_LEGAL_NAME + ', ';
      }
      if (c.INDIVIDUALS_FIRST_NAME) {
        res += c.INDIVIDUALS_FIRST_NAME + ' ';
      }
      if (c.INDIVIDUALS_LAST_NAME) {
        res += c.INDIVIDUALS_LAST_NAME + ', ';
      }
    });
    this.result = res.replace(/,\s*$/, '');
    // console.log(this.result);
    // alert('Save is not yet implemented');
    this.close();
  }
}
