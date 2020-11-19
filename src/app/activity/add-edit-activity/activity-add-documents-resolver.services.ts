import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';

@Injectable()
export class ActivityAddDocumentsResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
    private storageService: StorageService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
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
