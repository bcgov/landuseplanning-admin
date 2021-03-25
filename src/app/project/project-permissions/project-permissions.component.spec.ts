import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectPermissionsComponent } from './project-permissions.component';

describe('ProjectPermissionsComponent', () => {
  let component: ProjectPermissionsComponent;
  let fixture: ComponentFixture<ProjectPermissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectPermissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
