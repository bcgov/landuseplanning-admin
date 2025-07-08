import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
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
    const projectId = route.parent.paramMap.get('projId');

    return this.searchService.getSearchResults(
      '', // Keywords
      'Document', // Model
      [{ 'name': 'project', 'value': projectId }], // Fields: relevant to this project
      1, // Page number
      100, // Page size
      '-datePosted', // Sort by
      { eaoStatus: 'Published' }, // Modifier: Only retrieve published files
      true // Populate?
    );
  }
}
