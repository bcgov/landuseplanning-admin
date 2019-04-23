import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditActivityComponent } from './add-edit-activity.component';

describe('AddEditActivityComponent', () => {
  let component: AddEditActivityComponent;
  let fixture: ComponentFixture<AddEditActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
