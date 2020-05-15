import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailSubscribeTableRowsComponent } from './email-subscribe-table-rows.component';

describe('EmailSubscribeTableRowsComponent', () => {
  let component: EmailSubscribeTableRowsComponent;
  let fixture: ComponentFixture<EmailSubscribeTableRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailSubscribeTableRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailSubscribeTableRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
