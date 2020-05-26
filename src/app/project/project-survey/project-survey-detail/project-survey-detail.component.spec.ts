import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSurveyDetailComponent } from './project-survey-detail.component';

describe('ProjectSurveyDetailComponent', () => {
  let component: ProjectSurveyDetailComponent;
  let fixture: ComponentFixture<ProjectSurveyDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectSurveyDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSurveyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
