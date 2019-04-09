import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';
import { DocumentService } from 'app/services/document.service';

@Injectable()
export class DocumentDetailResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
    private documentService: DocumentService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
    const docId = route.paramMap.get('docId');
    return this.documentService.getById(docId);
  }
}
