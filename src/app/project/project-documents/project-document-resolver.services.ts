import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';

@Injectable()
export class DocumentsResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
    private storageService: StorageService
  ) { }

  /**
   * Get route params and make a request to the API to get a set of
   * documents(files) that match the request params.
   *
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<Object>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const projectId = route.parent.paramMap.get('projId');
    if (this.storageService.state.projectDocumentTableParams == null) {
      const pageNum = route.params.pageNum ? route.params.pageNum : 1;
      const pageSize = route.params.pageSize ? route.params.pageSize : 10;
      const sortBy = route.params.sortBy ? route.params.sortBy : '-datePosted';
      const keywords = route.params.keywords || '';
      return this.searchService.getSearchResults(
        keywords,
        'Document',
        [{ 'name': 'project', 'value': projectId }],
        pageNum,
        pageSize,
        sortBy,
        {},
        true);
    } else {
      return this.searchService.getSearchResults(
        this.storageService.state.projectDocumentTableParams.keywords,
        'Document',
        [{ 'name': 'project', 'value': projectId }],
        this.storageService.state.projectDocumentTableParams.pageNum,
        this.storageService.state.projectDocumentTableParams.pageSize,
        this.storageService.state.projectDocumentTableParams.sortBy,
        {},
        true);
    }
  }
}
