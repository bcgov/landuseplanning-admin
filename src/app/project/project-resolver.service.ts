import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ProjectService } from 'app/services/project.service';
import { Project } from 'app/models/project';

@Injectable()
export class ProjectResolver implements Resolve<Project> {

  constructor(
    private projectService: ProjectService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Project> {
    const projId = route.paramMap.get('projId');
    return this.projectService.getById(projId);
  }

}
