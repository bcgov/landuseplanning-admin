import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

import { AddEditProjectSurveyComponent } from './add-edit-project-survey.component';

@Injectable()
export class AddEditRouteGuard implements CanDeactivate<AddEditProjectSurveyComponent> {
  constructor() {}

  /**
   * A route guard to prevent the user from navigating away from the survey form
   * without saving their changes. The user will be prompted if they navigate
   * away from this component without saving.
   * 
   * @param {AddEditProjectSurveyComponent} component The component to guard.
   * @returns {boolean}
   */
  canDeactivate(component: AddEditProjectSurveyComponent): boolean {
    if (component.surveyChanged && !component.changesSaved) {
      return confirm('Are you sure you wish to exit the survey builder? Your unsaved changes will be lost.');
    }
    return true;
  }
}
