import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';
import { DocumentService } from 'app/services/document.service';

@Injectable()
export class DocumentDetailResolver implements Resolve<Observable<object>> {
  constructor(
    private documentService: DocumentService
  ) { }

  /**
   * Get route params and make a request to the API to get a single
   * document(file) that matches the request params.
   *
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<Object>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const docId = route.paramMap.get('docId');
    return this.documentService.getById(docId);
  }
}
