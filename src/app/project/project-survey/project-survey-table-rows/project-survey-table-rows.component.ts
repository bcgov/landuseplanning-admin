import { Component, Input, OnInit } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-survey-table-rows',
  templateUrl: './project-survey-table-rows.component.html',
  styleUrls: ['./project-survey-table-rows.component.scss']
})
export class ProjectSurveyTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;

  public surveys: any;
  public paginationData: any;

  constructor(
      private router: Router
  ) { }

  /**
   * Get the survey and pagination data from the route resolver.
   * 
   * @return {void}
   */
  ngOnInit() {
      this.surveys = this.data.data;
      this.paginationData = this.data.paginationData;
  }

  /**
   * Navigate the user to the survey they clicked on in the table.
   * 
   * @param {Survey} survey The selected survey from the table.
   * @return {void}
   */
  goToItem(survey) {
      this.router.navigate([`p/${survey.project}/s/${survey._id}/project-survey-details`]);
  }
}
