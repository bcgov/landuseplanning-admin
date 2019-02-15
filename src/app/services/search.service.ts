import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of, merge, forkJoin } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { ProjectService } from 'app/services/project.service';
import { SearchResults } from 'app/models/search';
import { Client } from 'app/models/client';
import { Project } from 'app/models/project';
import { Feature } from 'app/models/feature';

@Injectable()
export class SearchService {

  public isError = false;

  constructor(
    private api: ApiService,
    private projectService: ProjectService
  ) { }

  getSearchResults(keys: string[]): Observable<any[]> {
    const searchResults = this.api.searchKeywords(keys)
    .map(res => {
      let allResults = <any>[];
      res.forEach(item => {
        const r = new SearchResults({type: 'project', project: new Project(item)});
        allResults.push(r);
      });
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
