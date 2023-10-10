import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { DocumentSectionService } from 'app/services/documentSection.service';

@Injectable()
export class UploadResolver implements Resolve<Observable<object>> {
  constructor(
    private documentSectionService: DocumentSectionService
  ) { }

  /**
   * Get route params and make a request to the API to get a set of
   * document(file) sections for the current project.
   *
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<Object>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const projectId = route.parent.paramMap.get('projId');

    return this.documentSectionService.getAll(projectId);
  }
}
