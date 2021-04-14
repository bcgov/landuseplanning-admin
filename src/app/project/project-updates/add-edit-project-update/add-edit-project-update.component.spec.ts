import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditProjectUpdateComponent } from './add-edit-project-update.component';

describe('AddEditActivityComponent', () => {
  let component: AddEditProjectUpdateComponent;
  let fixture: ComponentFixture<AddEditProjectUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditProjectUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditProjectUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
