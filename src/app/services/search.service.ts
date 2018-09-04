import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/merge';

import { ApiService } from './api';
import { SearchResults } from 'app/models/search';
import { Client } from 'app/models/client';

@Injectable()
export class SearchService {
  private clients: Array<Client> = null;
  private ClidSearch: SearchResults = null;
  private DtidSearch: SearchResults = null;

  constructor(private api: ApiService) { }

  // get clients by Disposition Transaction ID
  getClientsByDTID(dtid: number, forceReload: boolean = false): Observable<Client[]> {
    if (!forceReload
      && this.clients
      && this.clients.length > 0
      && this.clients[0].DISPOSITION_TRANSACTION_SID === dtid) {
      return Observable.of(this.clients);
    }

    return this.api.getClientsByDTID(dtid)
      .map(res => {
        const clients = res.text() ? res.json() : [];
        clients.forEach((client, i) => {
          clients[i] = new Client(client);
        });
        return clients;
      })
      .map((clients: Client[]) => {
        if (clients.length === 0) {
          return [];
        }

        this.clients = clients;
        return this.clients;
      })
      .catch(this.api.handleError);
  }

  // get search results by array of CLIDs or DTIDs
  getByClidDtid(keys: string[], forceReload: boolean = false): Observable<SearchResults> {
    const observables = keys.map(key => { return this.getByCLID(key, forceReload); })
      .concat(keys.map(key => { return this.getByDTID(+key, forceReload); }));
    return Observable.of(new SearchResults()).merge(...observables);
  }

  // get search results by CL File #
  getByCLID(clid: string, forceReload: boolean = false): Observable<SearchResults> {
    if (!forceReload
      && this.ClidSearch
      && this.ClidSearch.features
      && this.ClidSearch.features.length > 0
      && this.ClidSearch.features[0].properties
      && this.ClidSearch.features[0].properties.CROWN_LANDS_FILE === clid) {
      return Observable.of(this.ClidSearch);
    }

    return this.api.getAppsByCLID(clid)
      .map(res => {
        return res.text() ? new SearchResults(res.json()) : null;
      })
      .map((search: SearchResults) => {
        if (!search) { return null; }

        this.ClidSearch = search;
        return this.ClidSearch;
      })
      .catch(this.api.handleError);
  }

  // get search results by Disposition Transaction ID
  getByDTID(dtid: number, forceReload: boolean = false): Observable<SearchResults> {
    if (!forceReload
      && this.DtidSearch
      && this.DtidSearch.features
      && this.DtidSearch.features.length > 0
      && this.DtidSearch.features[0].properties
      && this.DtidSearch.features[0].properties.DISPOSITION_TRANSACTION_SID === dtid) {
      return Observable.of(this.DtidSearch);
    }

    return this.api.getAppsByDTID(dtid)
      .map(res => {
        return res.text() ? new SearchResults(res.json()) : null;
      })
      .map((search: SearchResults) => {
        if (!search) { return null; }

        this.DtidSearch = search;
        return this.DtidSearch;
      })
      .catch(this.api.handleError);
  }
}
