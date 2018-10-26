import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { merge } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { SearchResults } from 'app/models/search';
import { Client } from 'app/models/client';

@Injectable()
export class SearchService {

  constructor(private api: ApiService) { }

  // get clients by Disposition Transaction ID
  getClientsByDTID(dtid: number): Observable<Client[]> {
    return this.api.getClientsByDTID(dtid)
      .map(res => {
        if (res && res.length > 0) {
          const clients: Array<Client> = [];
          res.forEach(c => {
            clients.push(new Client(c));
          });
          return clients;
        }
        return [];
      })
      .catch(error => this.api.handleError(error));
  }

  // get search results by array of CLIDs or DTIDs
  getByClidDtid(keys: string[]): Observable<SearchResults> {
    const observables = keys.map(key => { return this.getByCLID(key); })
      .concat(keys.map(key => { return this.getByDTID(+key); }));
    return merge(...observables)
      .catch(error => this.api.handleError(error));
  }

  // get search results by CL File #
  getByCLID(clid: string): Observable<SearchResults> {
    return this.api.getAppsByCLID(clid)
      .map(res => {
        return res ? new SearchResults(res) : null;
      })
      .catch(error => this.api.handleError(error));
  }

  // get search results by Disposition Transaction ID
  getByDTID(dtid: number): Observable<SearchResults> {
    return this.api.getAppsByDTID(dtid)
      .map(res => {
        return res ? new SearchResults(res) : null;
      })
      .catch(error => this.api.handleError(error));
  }

}
