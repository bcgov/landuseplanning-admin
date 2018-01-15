import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentPeriodComponent } from './comment-period.component';

describe('CommentPeriodComponent', () => {
  let component: CommentPeriodComponent;
  let fixture: ComponentFixture<CommentPeriodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentPeriodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
