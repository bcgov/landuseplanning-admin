import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewSurveyResponsesTabComponent } from './review-survey-responses-tab.component';

describe('ReviewSurveyResponsesTabComponent', () => {
  let component: ReviewSurveyResponsesTabComponent;
  let fixture: ComponentFixture<ReviewSurveyResponsesTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewSurveyResponsesTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewSurveyResponsesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
