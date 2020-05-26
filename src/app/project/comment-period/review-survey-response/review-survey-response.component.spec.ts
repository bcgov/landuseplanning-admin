import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewSurveyResponseComponent } from './review-survey-response.component';

describe('ReviewSurveyResponseComponent', () => {
  let component: ReviewSurveyResponseComponent;
  let fixture: ComponentFixture<ReviewSurveyResponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewSurveyResponseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewSurveyResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
