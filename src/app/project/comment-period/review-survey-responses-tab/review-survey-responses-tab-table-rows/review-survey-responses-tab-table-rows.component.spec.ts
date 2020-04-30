import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewSurveyResponsesTabTableRowsComponent } from './review-survey-responses-tab-table-rows.component';

describe('ReviewSurveyResponsesTabTableRowsComponent', () => {
  let component: ReviewSurveyResponsesTabTableRowsComponent;
  let fixture: ComponentFixture<ReviewSurveyResponsesTabTableRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewSurveyResponsesTabTableRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewSurveyResponsesTabTableRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
