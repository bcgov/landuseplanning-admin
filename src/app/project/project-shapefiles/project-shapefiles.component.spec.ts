import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectShapefilesComponent } from './project-shapefiles.component';

describe('ProjectShapefilesComponent', () => {
  let component: ProjectShapefilesComponent;
  let fixture: ComponentFixture<ProjectShapefilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectShapefilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectShapefilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
