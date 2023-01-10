import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';

@Injectable()
export class ShapeFileResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
    private storageService: StorageService
  ) { }

  /**
   * Get route params and make a request to the API to get a set of shapefiles
   * that match the search params.
   *
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<Object>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    let pageNum = 1;
    let pageSize = 10;
    let sortBy = '-datePosted';
    let keywords = '';
    const projectId = route.parent.paramMap.get('projId');

    if (this.storageService.state.projectDocumentTableParams == null) {
      pageNum = route.params.pageNum ? route.params.pageNum : 1;
      pageSize = route.params.pageSize ? route.params.pageSize : 10;
      sortBy = route.params.sortBy ? route.params.sortBy : '-datePosted';
      keywords = route.params.keywords || '';
    } else {
      pageNum = this.storageService.state.projectDocumentTableParams.pageNum;
      pageSize = this.storageService.state.projectDocumentTableParams.pageSize;
      sortBy = this.storageService.state.projectDocumentTableParams.sortBy;
      keywords = this.storageService.state.projectDocumentTableParams.keywords;
    }

    return this.searchService.getSearchResults(
      keywords,
      'Document',
      [{ 'name': 'project', 'value': projectId }],
      pageNum,
      pageSize,
      sortBy,
      {},
      true);
  }
}
