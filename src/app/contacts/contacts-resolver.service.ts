import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { SearchService } from 'app/services/search.service';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Injectable()
export class ContactsResolver implements Resolve<object> {
  constructor(
    private searchService: SearchService,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  /**
   * Get route params and make a request to the search API.
   *
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<object>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    let tableParams = this.tableTemplateUtils.getParamsFromUrl(route.params);

    return this.searchService.getSearchResults(
      tableParams.keywords || '',
      'User',
      null,
      tableParams.currentPage,
      tableParams.pageSize,
      tableParams.sortBy,
      {});
  }
}
