import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { StorageService } from 'app/services/storage.service';
import { DocumentSectionService } from 'app/services/documentSection.service';

@Injectable()
export class FileSectionsResolver implements Resolve<Observable<object>> {
  constructor(
    private documentSectionService: DocumentSectionService,
    private storageService: StorageService
  ) { }

  /**
   * Get route params and make a request to the API to get all
   * documents(file) sections by project.
   *
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<Object>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<object> {
      const projectId = route.parent.paramMap.get('projId');
      return this.documentSectionService.getAll(projectId);
    }
}
