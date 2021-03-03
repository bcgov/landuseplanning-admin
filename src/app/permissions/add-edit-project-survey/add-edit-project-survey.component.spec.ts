import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditProjectSurveyComponent } from './add-edit-project-survey.component';

describe('AddEditProjectSurveyComponent', () => {
  let component: AddEditProjectSurveyComponent;
  let fixture: ComponentFixture<AddEditProjectSurveyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditProjectSurveyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditProjectSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
