import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCommentPeriodsComponent } from './manage-comment-periods.component';

describe('ManageCommentPeriodsComponent', () => {
  let component: ManageCommentPeriodsComponent;
  let fixture: ComponentFixture<ManageCommentPeriodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageCommentPeriodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCommentPeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
