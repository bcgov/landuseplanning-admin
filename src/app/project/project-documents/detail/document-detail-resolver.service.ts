import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, forkJoin, from } from 'rxjs';

import { DocumentSectionService } from 'app/services/documentSection.service';
import { DocumentService } from 'app/services/document.service';

@Injectable()
export class DocumentDetailResolver implements Resolve<Observable<object>> {
  constructor(
    private documentService: DocumentService,
    private documentSectionService: DocumentSectionService
  ) { }

  /**
   * Get route params and make a request to the API to get a single
   * document(file) that matches the request params. Also get all document sections.
   *
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<Object>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const docId = route.paramMap.get('docId');
    const projectId = route.parent.paramMap.get('projId');

    return forkJoin(
      from(this.documentService.getById(docId)),
      from(this.documentSectionService.getAll(projectId))
    ).map(([document, sections]) => {
      return { document: document, sections: sections };
    })
  }
}
