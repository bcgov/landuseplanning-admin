import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSurveyTableRowsComponent } from './project-survey-table-rows.component';

describe('ProjectSurveyTableRowsComponent', () => {
  let component: ProjectSurveyTableRowsComponent;
  let fixture: ComponentFixture<ProjectSurveyTableRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectSurveyTableRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSurveyTableRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
