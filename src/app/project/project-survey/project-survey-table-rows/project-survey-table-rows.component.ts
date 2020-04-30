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

  ngOnInit() {
      this.surveys = this.data.data;
      this.paginationData = this.data.paginationData;
  }

  goToItem(survey) {
      this.router.navigate([`p/${survey.project}/s/${survey._id}/project-survey-details`]);
  }
}
