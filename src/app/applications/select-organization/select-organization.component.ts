import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import { SearchService } from 'app/services/search.service';
import { Client } from 'app/models/client';

export interface DataModel {
  dispositionId: number;
}

@Component({
  selector: 'app-select-organization',
  templateUrl: './select-organization.component.html',
  styleUrls: ['./select-organization.component.scss']
})

// NOTE: dialog components must not implement OnDestroy
//       otherwise they don't return a result
export class SelectOrganizationComponent extends DialogComponent<DataModel, string> implements DataModel, OnInit {
  public dispositionId: number = null;
  public clients: Array<Client> = [];
  public selectedClients: Array<Client> = [];
  public page = 1;

  constructor(
    public dialogService: DialogService,
    private router: Router,
    private searchService: SearchService
  ) {
    super(dialogService);
  }

  ngOnInit() {
    const self = this;
    this.searchService.getClientsByDispositionId(this.dispositionId)
      .subscribe(
        data => {
          _.each(data, function (i) {
            self.clients.push(new Client(i));
            // Pre-select the existing clients if they're in the list
            // if (i._id === self.dispositionId) {
            //   self.selectedClients = i;
            // }
          });
        },
        error => {
          // if 403, redir to login page
          if (error.startsWith('403')) { this.router.navigate(['/login']); }
          alert('Error loading clients');
        });
  }

  toggleClient(client: Client) {
    if (this.isClientSelected(client)) {
      _.remove(this.selectedClients, client);
    } else {
      this.selectedClients.push(client);
    }
  }

  isClientSelected(client: Client): boolean {
    // TODO: this should be debounced as it's called a lot! (mouse over clickable row to see this)
    const foundClient = _.find(this.selectedClients, function (c) {
      return (c === client);
    });
    return foundClient ? true : false;
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
    // trim the last comma
    this.result = res.replace(/,\s*$/, '');
    this.close();
  }
}
