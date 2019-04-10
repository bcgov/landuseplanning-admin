import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';

@Injectable()
export class ContactsResolverService implements Resolve<object> {
  constructor(
    private searchService: SearchService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
    const pageNum = Number(route.queryParams['pageNum'] ? route.queryParams['pageNum'] : 1);
    const pageSize = Number(route.queryParams['pageSize'] ? route.queryParams['pageSize'] : 10);
    const sortBy = route.queryParams['sortBy'] ? route.queryParams['sortBy'] : null;
    const keywords = route.params.keywords;
    return this.searchService.getSearchResults(keywords,
                                              'User',
                                              null,
                                              pageNum,
                                              pageSize,
                                              sortBy,
                                              null);
  }
}
