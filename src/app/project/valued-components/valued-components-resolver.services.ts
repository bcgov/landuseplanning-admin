import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ValuedComponentService } from 'app/services/valued-component.service';

@Injectable()
export class ValuedComponentsResolver implements Resolve<Observable<object>> {
  constructor(
    private valuedComponentService: ValuedComponentService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
    const projectId = route.parent.paramMap.get('projId');
    const pageNum = Number(route.queryParams['pageNum'] ? route.queryParams['pageNum'] : 1);
    const pageSize = Number(route.queryParams['pageSize'] ? route.queryParams['pageSize'] : 10);

    return this.valuedComponentService.getAllByProjectId(projectId, pageNum, pageSize);
  }
}
