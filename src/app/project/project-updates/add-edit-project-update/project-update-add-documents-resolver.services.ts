import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';

@Injectable()
export class ProjectUpdateAddDocumentsResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
  ) { }

  /**
   * Get route params and make a request to the API to get a set of documents
   * that match the search params.
   *
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<Object>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const pageNum = Number(route.queryParams['pageNum'] ? route.queryParams['pageNum'] : 1);
    const pageSize = Number(route.queryParams['pageSize'] ? route.queryParams['pageSize'] : 10);
    const sortBy = route.queryParams['sortBy'] ? route.queryParams['sortBy'] : null;
    const keywords = route.params.keywords;
    return this.searchService.getSearchResults(keywords,
      'Document',
      null,
      pageNum,
      pageSize,
      sortBy,
      { documentSource: 'PROJECT' },
      );
  }
}
