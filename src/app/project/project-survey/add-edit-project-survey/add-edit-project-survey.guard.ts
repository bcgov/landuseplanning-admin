import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

import { AddEditProjectSurveyComponent } from './add-edit-project-survey.component';

@Injectable()
export class AddEditRouteGuard implements CanDeactivate<AddEditProjectSurveyComponent> {
  constructor() {}

  canDeactivate(component: AddEditProjectSurveyComponent): boolean {
    if (component.surveyChanged && !component.changesSaved) {
      return confirm('Are you sure you wish to exit the survey builder? Your unsaved changes will be lost.');
    }
    return true;
  }
}
