import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditCommentPeriodComponent } from './add-edit-comment-period.component';

describe('AddEditCommentPeriodComponent', () => {
  let component: AddEditCommentPeriodComponent;
  let fixture: ComponentFixture<AddEditCommentPeriodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditCommentPeriodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditCommentPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
