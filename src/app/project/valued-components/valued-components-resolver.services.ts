import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ValuedComponentService } from 'app/services/valued-component.service';

@Injectable()
export class ValuedComponentsResolver implements Resolve<Observable<object>> {
  constructor(
    private valuedComponentService: ValuedComponentService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const projectId = route.parent.paramMap.get('projId');
    const pageNum = route.params.pageNum ? route.params.pageNum : 1;
    const pageSize = route.params.pageSize ? route.params.pageSize : 10;
    const sortBy = route.params.sortBy ? route.params.sortBy : null;

    return this.valuedComponentService.getAllByProjectId(projectId, pageNum, pageSize, sortBy);
  }
}
