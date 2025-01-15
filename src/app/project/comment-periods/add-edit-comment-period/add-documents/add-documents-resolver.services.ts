import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';

import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';

@Injectable()
export class AddDocumentsResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
    private storageService: StorageService
  ) { }

	/**
	 * Retrieves documents or external links
	 * 
	 * @param {ActivatedRouteSnapshot} route The route to get params from.
	 * @param {string} schema The schema type to use, either 'Document' or 'ExternalLink'
	 * @param {string} projectId The project ID of the documents you wish to retrieve
	 * @returns {Observable<Object>}
	 */
	getFiles = (route: ActivatedRouteSnapshot, schema: string, projectId: string): Observable<Object> => {
		const keys = route.params.keywords || '';
		const dataset = schema;
		const fields = [{ 'name': 'project', 'value': projectId }];
		const pageNum = 1;
		const pageSize = 1000;
		const sortBy = route.queryParams['sortBy'] || null;
		const queryModifier = {};
		const populate = true;
		return this.searchService.getSearchResults(keys, dataset, fields, pageNum, pageSize, sortBy, queryModifier, populate);
	} 

  /**
   * Get route params and make a request to the API to get a set of
   * documents(files) that match the request params.
   *
   * @param {ActivatedRouteSnapshot} route The route to get params from.
   * @returns {Observable<Object>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const projectId = this.storageService.state.currentProject?.data?._id || route.parent.parent.params.projId;
		const documents = this.getFiles(route, 'Document', projectId);
		const externalLinks = this.getFiles(route, 'ExternalLink', projectId);
		return forkJoin({
			documents: documents,
			externalLinks: externalLinks,
		});
  }
}

