import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { SearchResults } from 'app/models/search';

@Injectable()
export class SearchService {
  public isError = false;

  constructor(
    private api: ApiService,
  ) { }

  /**
   * Get item via search endpoint - can be any valid schema the app uses
   * (Project, Document, RecentActivity, etc.).
   *
   * @param {string} _id The ID of the item to retrieve.
   * @param {string} schema The schema type(Project, Document, RecentActivity, etc.).
   * @returns {Observable}
   */
  getItem(_id: string, schema: string): Observable<any> {
    const searchResults = this.api.getItem(_id, schema)
      .map(res => {
        let allResults = <any>[];
        res.forEach(item => {
          const r = new SearchResults({ type: item._schemaName, data: item });
          allResults.push(r);
        });
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

  /**
   * Search any schema. Return the exact fields and optionally paginate and sort
   * the results. You can also populate the search results(MongoDB operation).
   *
   * @param {string} keys The search keywords.
   * @param {string} dataset The schema to use(Project, Document, RecentActivity, etc.).
   * @param {Array} fields The fields to return on the object.
   * @param {number} pageNum The page number to paginate with.
   * @param {number} pageSize The page size to paginate with.
   * @param {string} sortBy The field to sort by.
   * @param {object} queryModifier Change the combination of fields to return by.
   * @param {boolean} populate Whether or not to populate the results.
   * @param {object} filter Filter to only include certain fields.
   * @returns {Observable}
   */
  getSearchResults(keys: string, dataset: string, fields: any[], pageNum: number = 1, pageSize: number = 10, sortBy: string = null, queryModifier: object = {}, populate: boolean = false, filter: object = {}): Observable<any[]> {
    if (sortBy === '') {
      sortBy = null;
    }
    const searchResults = this.api.searchKeywords(keys, dataset, fields, pageNum, pageSize, sortBy, queryModifier, populate, filter)
      .map(res => {
        let allResults = <any>[];
        res.forEach(item => {
          const r = new SearchResults({ type: item._schemaName, data: item });
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
