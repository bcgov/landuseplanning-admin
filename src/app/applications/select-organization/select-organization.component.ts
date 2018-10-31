import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { ApiService } from 'app/services/api';

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
  public isLoading = true;
  public dispositionId: number = null;
  public clients: Array<Client> = [];
  public selectedClients: Array<Client> = [];
  public page = 1;

  constructor(
    public dialogService: DialogService,
    private router: Router,
    private searchService: SearchService,
    private api: ApiService
  ) {
    super(dialogService);
  }

  ngOnInit() {
    this.searchService.getClientsByDTID(this.dispositionId)
      .subscribe(
        clients => {
          this.isLoading = false;
          this.clients = clients;
        },
        error => {
          this.isLoading = false;
          console.log('error =', error);
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
