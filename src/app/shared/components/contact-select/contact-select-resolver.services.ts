import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Injectable()
export class ContactSelectResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  /**
   * Get route params and make a request to the API to get a set of contacts
   * that match the search params.
   *
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<Object>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    let tableParams = this.tableTemplateUtils.getParamsFromUrl(route.params, null, 15);
    if (tableParams.sortBy === '') {
      tableParams.sortBy = '+name';
      this.tableTemplateUtils.updateUrl(tableParams.sortBy, tableParams.currentPage, tableParams.pageSize, null, tableParams.keywords);
    }
    return this.searchService.getSearchResults(
      tableParams.keywords || '',
      'User',
      null,
      tableParams.currentPage,
      tableParams.pageSize,
      tableParams.sortBy,
      {},
      false);
  }
}
