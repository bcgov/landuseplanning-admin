import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { SearchService } from 'app/services/search.service';

@Injectable()
export class EditContactResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
  ) { }

  /**
   * Get the params from the route and make a call to the API with it.
   * 
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<object>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const contactId = route.paramMap.get('contactId');
    return this.searchService.getItem(contactId, 'User');
  }
}
