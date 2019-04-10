import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTableRowsComponent } from './user-table-rows.component';

describe('UserTableRowsComponent', () => {
  let component: UserTableRowsComponent;
  let fixture: ComponentFixture<UserTableRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserTableRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTableRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
