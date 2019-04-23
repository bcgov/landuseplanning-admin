import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of, merge, forkJoin } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { ProjectService } from 'app/services/project.service';
import { SearchResults } from 'app/models/search';

@Injectable()
export class SearchService {

  public isError = false;

  constructor(
    private api: ApiService,
    private projectService: ProjectService
  ) { }

  getItem(_id: string, schema: string): Observable<any> {
    const searchResults = this.api.getItem(_id, schema)
    .map(res => {
      let allResults = <any>[];
      res.forEach(item => {
        const r = new SearchResults({type: item._schemaName, data: item});
        allResults.push(r);
      });
      console.log('Service results: ', allResults);
      if (allResults.length === 1) {
        return allResults[0];
      } else {
        return {};
      }
    })
    .catch(() => {
      this.isError = true;
      // if call fails, return null results
      return of(null as SearchResults);
    });
    return searchResults;
  }

  getSearchResults(keys: string, dataset: string, fields: any[], pageNum: number = 1, pageSize: number = 10, sortBy: string = null, queryModifier: string = null, populate: boolean = false): Observable<any[]> {
    const searchResults = this.api.searchKeywords(keys, dataset, fields, pageNum, pageSize, sortBy, queryModifier, populate)
    .map(res => {
      let allResults = <any>[];
      res.forEach(item => {
        const r = new SearchResults({type: item._schemaName, data: item});
        allResults.push(r);
      });
      console.log('Service results: ', allResults);
      return allResults;
    })
    .catch(() => {
      this.isError = true;
      // if call fails, return null results
      return of(null as SearchResults);
    });
    return searchResults;
  }
}
