import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectEmailSubscribeComponent } from './project-email-subscribe.component';

describe('ProjectEmailSubscribeComponent', () => {
  let component: ProjectEmailSubscribeComponent;
  let fixture: ComponentFixture<ProjectEmailSubscribeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectEmailSubscribeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectEmailSubscribeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
