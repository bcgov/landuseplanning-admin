import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDocumentsComponent } from './project-documents.component';

describe('ProjectDocumentsComponent', () => {
  let component: ProjectDocumentsComponent;
  let fixture: ComponentFixture<ProjectDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
