import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

import { SurveyResponse } from 'app/models/surveyResponse';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-review-survey-responses-tab-table-rows',
  templateUrl: './review-survey-responses-tab-table-rows.component.html',
  styleUrls: ['./review-survey-responses-tab-table-rows.component.scss']
})
export class ReviewSurveyResponsesTabTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public surveyResponses: SurveyResponse[];
  public paginationData: any;
  public projectId: string;

  constructor(
    private router: Router,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.projectId = this.storageService.state.currentProject.data._id;
    this.surveyResponses = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  goToItem(surveyResponse) {
    this.router.navigate([`p/${this.projectId}/cp/${surveyResponse.period}/sr/${surveyResponse._id}/details`]);
  }
}
